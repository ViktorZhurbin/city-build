import { CONFIG, TICKS_PER_DAY } from "../CONFIG";
import type { City } from "../types";
import {
	customersServed,
	population,
	powerSupply,
	waterSupply,
} from "./simulation";

export function tick(city: City): City {
	// 1. Power: produced by power plants, then allocated greedily in placement
	//    order. Whoever's first in the array gets served first; when supply runs
	//    out, the rest go dark. (Placement order mattering is a feature.)
	let powerLeft = powerSupply(city.buildings);

	const poweredBuildings = city.buildings.map((building) => {
		const buildingConfig = CONFIG[building.type];
		const isPowered = powerLeft >= buildingConfig.powerUse;

		if (isPowered) {
			powerLeft -= buildingConfig.powerUse;
		}

		return { ...building, powered: isPowered };
	});

	// 2. Water: only *powered* water plants produce any (a water plant needs
	//    power), then allocated the same greedy way.
	let waterLeft = waterSupply(poweredBuildings);

	const suppliedBuildings = poweredBuildings.map((building) => {
		const buildingConfig = CONFIG[building.type];
		const isWatered = waterLeft >= buildingConfig.waterUse;

		if (isWatered) {
			waterLeft -= buildingConfig.waterUse;
		}
		return { ...building, watered: isWatered };
	});

	// 3. Jobs: population from operable houses seeds the labour pool; only
	//    operable (powered + watered) stores compete for it. Once labour runs
	//    out, remaining stores sit idle.
	let availableLabour = population(suppliedBuildings);
	const finalBuildings = suppliedBuildings.map((building) => {
		if (building.type !== "store") {
			return building;
		}

		const { store } = CONFIG;

		const isSupplied = building.powered && building.watered;
		const isStaffed = availableLabour >= store.jobsNeeded;
		const isActive = isSupplied && isStaffed;

		if (isActive) {
			availableLabour -= store.jobsNeeded;
		}

		return { ...building, active: isActive };
	});

	// 4. Money: the budget settles ONCE per day, not every tick. In between,
	//    ticks just keep the physical sim (power/water/jobs) current. The day is
	//    a bare counter for now — later it can drive a visible day number and an
	//    end-of-day budget sheet.
	const tickCount = city.tick + 1;
	const dayElapsed = tickCount % TICKS_PER_DAY === 0;

	if (!dayElapsed) {
		return { ...city, tick: tickCount, buildings: finalBuildings };
	}

	// Revenue is demand-bound commerce: each served customer pays tax. Profit is
	// therefore capped by population while upkeep grows per building, so there's
	// an optimal city size and overbuilding bleeds money.
	const revenue = customersServed(finalBuildings) * CONFIG.store.taxPerCustomer;
	const upkeep = finalBuildings.reduce(
		(sum, building) => sum + CONFIG[building.type].upkeep,
		0,
	);

	return {
		...city,
		tick: tickCount,
		money: city.money + revenue - upkeep,
		buildings: finalBuildings,
	};
}
