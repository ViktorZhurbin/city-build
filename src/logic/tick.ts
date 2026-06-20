import { CONFIG } from "../CONFIG";
import type { City } from "../types";

export function tick(city: City): City {
	// 1. Power: produced by power plants, then allocated greedily in placement
	//    order. Whoever's first in the array gets served first; when supply runs
	//    out, the rest go dark. (Placement order mattering is a feature.)
	let powerLeft =
		city.buildings.filter((building) => building.type === "power").length *
		CONFIG.power.powerSupply;

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
	let waterLeft =
		poweredBuildings.filter(
			(building) => building.type === "water" && building.powered,
		).length * CONFIG.water.waterSupply;

	const suppliedBuildings = poweredBuildings.map((building) => {
		const buildingConfig = CONFIG[building.type];
		const isWatered = waterLeft >= buildingConfig.waterUse;

		if (isWatered) {
			waterLeft -= buildingConfig.waterUse;
		}
		return { ...building, watered: isWatered };
	});

	// 3. Population comes only from houses that have BOTH utilities.
	const population =
		suppliedBuildings.filter(
			(building) =>
				building.type === "house" && building.powered && building.watered,
		).length * CONFIG.house.population;

	// 4. Jobs: only operable (powered + watered) stores compete for the labour
	//    pool — a dark store employs no one. Once labour runs out, remaining
	//    stores sit idle.
	let availableLabour = population;
	const finalBuildings = suppliedBuildings.map((building) => {
		if (building.type !== "store") {
			return building;
		}

		const { store } = CONFIG;

		const isOperable = building.powered && building.watered;
		const isStaffed = availableLabour >= store.jobsNeeded;
		if (isStaffed) {
			availableLabour -= store.jobsNeeded;
		}

		return { ...building, active: isOperable && isStaffed };
	});

	// 5. Money: profit from active stores.
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
