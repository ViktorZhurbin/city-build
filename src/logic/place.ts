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
