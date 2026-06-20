import { CONFIG } from "../CONFIG";
import type { City } from "../types";
import { population, powerSupply, waterSupply } from "./simulation";

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

	// 4. Money: profit from active stores.
	const income =
		finalBuildings.filter(
			(building) => building.type === "store" && building.active,
		).length * CONFIG.store.profit;

	// (Optional later: upkeep cost per building, so idle buildings BLEED money
	//  and overbuilding utilities has a downside. That single change is what
	//  turns "build everything" into "build the right amount" — add it once the
	//  basic loop feels alive.)

	return {
		...city,
		money: city.money + income,
		buildings: finalBuildings,
	};
}
