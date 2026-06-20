import { CONFIG } from "../CONFIG";
import type { Building } from "../types";

// Derived quantities shared by tick (the write path) and stats (the read path),
// so the simulation's rules live in exactly one place.

export const powerSupply = (buildings: Building[]) =>
	buildings.filter((building) => building.type === "power").length *
	CONFIG.power.powerSupply;

// Only *powered* water plants produce water — a water plant needs power.
export const waterSupply = (buildings: Building[]) =>
	buildings.filter((building) => building.type === "water" && building.powered)
		.length * CONFIG.water.waterSupply;

// People come only from houses that have BOTH utilities.
export const population = (buildings: Building[]) =>
	buildings.filter(
		(building) =>
			building.type === "house" && building.powered && building.watered,
	).length * CONFIG.house.population;

// Total daily upkeep. Only utilities carry an `upkeep` field; houses and stores
// are taxpayers, so they contribute nothing here.
export const totalUpkeep = (buildings: Building[]) =>
	buildings.reduce((sum, building) => {
		const buildingConfig = CONFIG[building.type];
		return sum + ("upkeep" in buildingConfig ? buildingConfig.upkeep : 0);
	}, 0);

// Customers actually served: each active store can serve up to
// `customersServed` people, but the whole city can't serve more customers than
// it has residents. This population cap is what bounds revenue — building
// stores past the supply of people earns nothing.
export const customersServed = (buildings: Building[]) => {
	const storeCapacity =
		buildings.filter((building) => building.type === "store" && building.active)
			.length * CONFIG.store.customersServed;

	return Math.min(population(buildings), storeCapacity);
};

// Demand-bound commerce revenue: each served customer pays tax. Capped by
// population via `customersServed`, so revenue is sublinear while upkeep is
// linear — that's the optimal-city-size pressure.
export const totalRevenue = (buildings: Building[]) =>
	customersServed(buildings) * CONFIG.store.taxPerCustomer;

// Per-store share of the city's customers: the global pool (`population`) is
// handed out greedily in placement order — the same rule power/water/jobs use —
// so each active store takes up to `customersServed` until the residents run
// out. Keyed by store `pos`; the values sum to `customersServed(buildings)`.
// This is what makes a single store's revenue well-defined: it's whatever this
// store actually serves, not its capacity.
export const customersByStore = (
	buildings: Building[],
): Map<number, number> => {
	let customersLeft = population(buildings);
	const servedByPos = new Map<number, number>();

	for (const building of buildings) {
		const isActiveStore = building.type === "store" && building.active;

		if (!isActiveStore) {
			continue;
		}

		const servedHere = Math.min(CONFIG.store.customersServed, customersLeft);

		servedByPos.set(building.pos, servedHere);
		customersLeft -= servedHere;
	}

	return servedByPos;
};

// What one building contributes to the city right now — the read model behind a
// per-tile tooltip. All values are *live* (reflect the building's powered /
// watered / active flags), not nominal CONFIG figures: a dark house makes 0
// people, an over-saturated store earns $0 even at full capacity.
export interface BuildingContribution {
	population: number;
	upkeep: number;
	customers: number; // stores only: customers actually served this tick
	revenue: number; // stores only: served customers × tax
}

// Builds the contribution for every placed building in one pass (the customer
// attribution is computed once, then shared), keyed by `pos`.
export const contributions = (
	buildings: Building[],
): Map<number, BuildingContribution> => {
	const customersPerStore = customersByStore(buildings);
	const byPos = new Map<number, BuildingContribution>();

	for (const building of buildings) {
		const buildingConfig = CONFIG[building.type];
		const operable = building.powered && building.watered;

		const populationHere =
			building.type === "house" && operable ? CONFIG.house.population : 0;
		const customers = customersPerStore.get(building.pos) ?? 0;

		byPos.set(building.pos, {
			population: populationHere,
			upkeep: "upkeep" in buildingConfig ? buildingConfig.upkeep : 0,
			customers,
			revenue: customers * CONFIG.store.taxPerCustomer,
		});
	}

	return byPos;
};
