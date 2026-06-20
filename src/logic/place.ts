import { CONFIG, DEMOLISH_REFUND } from "../CONFIG";
import type { BuildingType, City } from "../types";

export function place(city: City, type: BuildingType, pos: number): City {
	const cellOccupied = city.buildings.some((building) => building.pos === pos);

	const { cost } = CONFIG[type];

	if (cellOccupied || city.money < cost) {
		return city;
	}

	return {
		...city,
		money: city.money - cost,
		buildings: [
			...city.buildings,
			{ type, pos, powered: false, watered: false, active: false },
		],
	};
}

// Remove a building, refunding a fraction of its cost. The refund is the escape
// hatch from a broke/over-built city (raze, recover cash, rebuild); being below
// 1 keeps overbuilding a net loss.
export function demolish(city: City, pos: number): City {
	const building = city.buildings.find((building) => building.pos === pos);

	if (!building) return city;

	const refund = Math.floor(CONFIG[building.type].cost * DEMOLISH_REFUND);

	return {
		...city,
		money: city.money + refund,
		buildings: city.buildings.filter((building) => building.pos !== pos),
	};
}
