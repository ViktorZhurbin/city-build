import { CONFIG } from "../CONFIG";
import type { BuildingType, City } from "../types";

// Placing a building: just affordability + push.
// No grid math needed (for now).
export function place(city: City, type: BuildingType): City {
	const cost = CONFIG[type].cost;
	if (city.money < cost) {
		// can't afford — no-op
		return city;
	}

	return {
		...city,
		money: city.money - cost,
		buildings: [
			...city.buildings,
			{ type, powered: false, watered: false, active: false },
		],
	};
}
