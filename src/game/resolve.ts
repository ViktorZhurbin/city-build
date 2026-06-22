import { BUILDINGS, TAX_RATE } from "@/game/balance";
import { type Building, type Buildings, selectAll } from "@/game/state";

// The engine. `resolve` runs the whole physical simulation as ONE pure pass over
// the durable buildings and returns the complete picture: each building's live
// flags/numbers plus the city-wide totals. Both the write path (tick's money
// settle) and the read path (the HUD + tile tooltips) consume this, so the rules
// live here and nowhere else.
//
// The sim is a chain of sequential greedy passes — power → water → population →
// jobs → customers. Each must fully settle before the next (water needs power
// done; jobs needs the population total), so each is its own walk over the
// buildings in placement order, handing out a pool until it runs out: atomic
// (all-or-nothing: power/water/jobs) or divisible (partial fills: customers).
// Every pass reads the flags the prior set and writes its own onto the building.

// A building after the sim has run: its durable facts plus everything derived
// this tick. All numbers are *live* — an offline house reads population 0, an
// idle store reads customers/revenue 0 — never nominal CONFIG figures.
export interface ResolvedBuilding extends Building {
	powered: boolean;
	watered: boolean;
	staffed: boolean; // stores only: online (powered + watered) AND has workers
	population: number; // houses only
	customers: number; // stores only: served this tick
	revenue: number; // stores only: customers × TAX_RATE
	upkeep: number; // utilities only
}

export function isBuildingOnline(building: ResolvedBuilding): boolean {
	return building.powered && building.watered;
}

function isStoreOnline(building: ResolvedBuilding) {
	return building.type === "store" && isBuildingOnline(building);
}

function isHouseOnline(building: ResolvedBuilding) {
	return building.type === "house" && isBuildingOnline(building);
}

// Why a building underperforms, derived from the resolved state.
// `power`/`water` are the hard *offline* deficits (the offline tile);
// `noWorkers`/`noCustomers` are the *idle* store states that earn
// $0 while still being online (powered + watered), so they aren't offline.
// A store is only ever offline OR idle, never both, since idle presumes online.
type OfflineIssue = "power" | "water";
type IdleIssue = "noWorkers" | "noCustomers";
export type BuildingIssue = OfflineIssue | IdleIssue;

export function buildingIssues(building: ResolvedBuilding): BuildingIssue[] {
	const issues: BuildingIssue[] = [];

	if (!building.powered) {
		issues.push("power");
	}

	if (!building.watered) {
		issues.push("water");
	}

	const storeOnline = isStoreOnline(building);

	if (storeOnline && !building.staffed) {
		issues.push("noWorkers");
	} else if (storeOnline && building.customers === 0) {
		issues.push("noCustomers");
	}

	return issues;
}

export interface CityTotals {
	powerSupply: number;
	powerDemand: number;
	waterSupply: number;
	waterDemand: number;
	population: number;
	jobs: number; // offered by online stores (the labour they'd draw if staffed)
	customersServed: number;
	revenue: number;
	upkeep: number;
}

// Mirrors the normalized input shape: `entities` keyed by cell, `ids` in the
// same placement order, plus the city totals.
export interface Resolved {
	ids: number[];
	entities: Record<number, ResolvedBuilding>;
	totals: CityTotals;
}

export function resolve(buildings: Buildings): Resolved {
	// Working copies in placement order. The sim is a chain of sequential greedy
	// passes: each is one walk over this list, reading the flags the prior pass
	// set and writing its own straight onto the building. Placement order is the
	// allocation priority, so the order of `working` is load-bearing.
	const resolvedBuildings: ResolvedBuilding[] = selectAll(buildings).map(
		(building) => {
			const config = BUILDINGS[building.type];

			return {
				...building,
				powered: false,
				watered: false,
				staffed: false,
				population: 0,
				customers: 0,
				revenue: 0,
				upkeep: "upkeep" in config ? config.upkeep : 0,
			};
		},
	);

	// 1. Power — every building draws its powerUse greedily (plants draw 0, so
	//    they're always powered); once supply runs out, the rest go offline.
	const powerSupply =
		resolvedBuildings.filter((building) => building.type === "power").length *
		BUILDINGS.power.powerSupply;

	let powerLeft = powerSupply;
	let powerDemand = 0;

	for (const building of resolvedBuildings) {
		const powerUse = BUILDINGS[building.type].powerUse;
		const powered = powerLeft >= powerUse;

		if (powered) {
			powerLeft -= powerUse;
		}

		building.powered = powered;
		powerDemand += powerUse;
	}

	// 2. Water — only *powered* water plants produce; allocated the same greedy way.
	const waterSupply =
		resolvedBuildings.filter(
			(building) => building.type === "water" && building.powered,
		).length * BUILDINGS.water.waterSupply;

	let waterLeft = waterSupply;
	let waterDemand = 0;

	for (const building of resolvedBuildings) {
		const waterUse = BUILDINGS[building.type].waterUse;
		const watered = waterLeft >= waterUse;

		if (watered) {
			waterLeft -= waterUse;
		}

		building.watered = watered;
		waterDemand += waterUse;
	}

	// 3. Population — houses with BOTH utilities make people. This same pool both
	//    staffs stores (jobs) and shops at them (customers).
	let population = 0;

	for (const building of resolvedBuildings) {
		if (isHouseOnline(building)) {
			building.population = BUILDINGS.house.population;
			population += BUILDINGS.house.population;
		}
	}

	// 4. Jobs — supplied stores claim workers greedily; once labour runs out, the
	//    rest sit idle. `jobs` is the labour supplied stores *offer* (what they'd
	//    draw if fully staffed).
	let labourLeft = population;
	let jobs = 0;

	for (const building of resolvedBuildings) {
		const storeOnline = isStoreOnline(building);

		if (storeOnline) {
			jobs += BUILDINGS.store.jobsNeeded;
		}

		const staffed = storeOnline && labourLeft >= BUILDINGS.store.jobsNeeded;

		if (staffed) {
			labourLeft -= BUILDINGS.store.jobsNeeded;
		}

		building.staffed = staffed;
	}

	// 5. Customers — the same population shops, handed out greedily across staffed
	//    stores (divisible: a store serves up to customersServed, partial allowed).
	let shoppersLeft = population;
	let customersServed = 0;

	for (const building of resolvedBuildings) {
		if (!building.staffed) {
			continue;
		}

		const served = Math.min(BUILDINGS.store.customersServed, shoppersLeft);

		shoppersLeft -= served;
		building.customers = served;
		building.revenue = served * TAX_RATE;
		customersServed += served;
	}

	// Entity map + the one total left to sum (upkeep); the rest accrued above.
	const entities: Record<number, ResolvedBuilding> = {};
	let upkeep = 0;

	for (const building of resolvedBuildings) {
		entities[building.pos] = building;
		upkeep += building.upkeep;
	}

	return {
		ids: buildings.ids,
		entities,
		totals: {
			powerSupply,
			powerDemand,
			waterSupply,
			waterDemand,
			jobs,
			population,
			customersServed,
			upkeep,
			revenue: customersServed * TAX_RATE,
		},
	};
}
