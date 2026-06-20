import { CONFIG } from "../CONFIG";
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

// Remove a building. No refund — bulldozing is the lever for digging out of an
// overbuild (cut upkeep), not a way to recoup the build cost.
export function demolish(city: City, pos: number): City {
	const building = city.buildings.find((building) => building.pos === pos);

	if (!building) return city;

	return {
		...city,
		buildings: city.buildings.filter((building) => building.pos !== pos),
	};
}
