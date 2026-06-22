export const GRID_SIZE = 10;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const STARTING_MONEY = 1000;
export const STARTING_POPULATION = 0;

// Population is a living stock, not an instant figure. Each day it drifts toward
// the city's housing capacity (sum of online houses): people move in gradually
// when there's room, and move OUT when capacity drops below them (a brownout or a
// bulldozed plant takes houses offline). Decline outpaces growth — cities empty
// faster than they fill. Both are bounded per day so the city breathes.
export const POPULATION_GROWTH_PER_DAY = 2;
export const POPULATION_DECLINE_PER_DAY = 4;

// The economy settles once per "day"; ticks in between only run the physical
// sim (power/water/jobs). For now a day is a bare counter. Later: surface a
// visible day number + an end-of-day budget sheet (SimCity-style revenue /
// expense breakdown).
export const TICKS_PER_DAY = 8;
export const TICK_MS = 1500;

// Bulldozing hands back this fraction of the build cost — the escape hatch from
// a broke/over-built city: raze, recover some cash, rebuild. Less than 1 so
// overbuilding still stings.
export const DEMOLISH_REFUND = 0.5;

// Income is one multiply: total customers served × this rate. A store's
// `customersServed` (capped by population) is HOW MUCH commerce happens; this is
// HOW MUCH of it the city takes. One city-wide number, not a per-store field.
// Later: expose it as a player-set slider — the core income-vs-growth dial, where
// a higher rate raises revenue per customer but suppresses demand/growth.
export const TAX_RATE = 6;

// --- Tuning knobs. This table IS the game's balance. ---
// Everything interesting lives here; tweak numbers, not logic.
export const BUILDINGS = {
	house: {
		cost: 100,
		powerUse: 1,
		waterUse: 1,
		population: 4,
		jobsNeeded: 0,
	},
	store: {
		cost: 150,
		powerUse: 2,
		waterUse: 1,
		population: 0,
		jobsNeeded: 3,
		// Commerce is demand-bound: a store serves up to `customersServed`
		// people (capped by total population). Income is `customers × TAX_RATE`
		// (see above) — staffing/utilities gate WHETHER a store serves customers,
		// not the per-customer take.
		customersServed: 4,
	},
	power: {
		cost: 200,
		powerUse: 0,
		waterUse: 0,
		powerSupply: 10,
		upkeep: 6,
	},
	water: {
		cost: 180,
		powerUse: 2,
		waterUse: 0,
		waterSupply: 10,
		upkeep: 5,
	},
} as const;
