import { CONFIG, TICKS_PER_DAY } from "../CONFIG";
import type { City } from "../types";
import {
	population,
	powerSupply,
	totalRevenue,
	totalUpkeep,
	waterSupply,
} from "./simulation";

export interface CityStats {
	money: number;
	powerSupply: number;
	powerDemand: number;
	waterSupply: number;
	waterDemand: number;
	population: number;
	jobs: number;
	dailyBudget: number; // revenue - upkeep, applied once per day
	day: number; // 1-based; the day currently in progress
	dayProgress: number; // 0..1 toward the next budget settle
}

export function stats(city: City): CityStats {
	// Demand: every building draws its utilities, whether or not it gets them.
	const totalUse = (resource: "powerUse" | "waterUse") =>
		city.buildings.reduce(
			(sum, building) => sum + CONFIG[building.type][resource],
			0,
		);

	// Jobs offered by operable stores — the labour they'd draw if staffed.
	const jobs =
		city.buildings.filter(
			(building) =>
				building.type === "store" && building.powered && building.watered,
		).length * CONFIG.store.jobsNeeded;

	// The budget the player would collect at the next day rollover, given the
	// city as it stands right now: tax on served customers minus total upkeep.
	const revenue = totalRevenue(city.buildings);
	const upkeep = totalUpkeep(city.buildings);

	return {
		jobs,
		money: city.money,
		powerDemand: totalUse("powerUse"),
		waterDemand: totalUse("waterUse"),
		powerSupply: powerSupply(city.buildings),
		waterSupply: waterSupply(city.buildings),
		population: population(city.buildings),
		dailyBudget: revenue - upkeep,
		day: Math.floor(city.tick / TICKS_PER_DAY) + 1,
		dayProgress: (city.tick % TICKS_PER_DAY) / TICKS_PER_DAY,
	};
}
