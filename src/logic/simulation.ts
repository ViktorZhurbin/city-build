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
