import { CONFIG } from "../CONFIG";
import type { City } from "../types";
import {
	customersServed,
	population,
	powerSupply,
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
	const revenue = customersServed(city.buildings) * CONFIG.store.taxPerCustomer;
	const upkeep = city.buildings.reduce(
		(sum, building) => sum + CONFIG[building.type].upkeep,
		0,
	);

	return {
		jobs,
		money: city.money,
		powerDemand: totalUse("powerUse"),
		waterDemand: totalUse("waterUse"),
		powerSupply: powerSupply(city.buildings),
		waterSupply: waterSupply(city.buildings),
		population: population(city.buildings),
		dailyBudget: revenue - upkeep,
	};
}
