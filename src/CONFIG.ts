export const GRID_SIZE = 10;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const STARTING_MONEY = 1000;

// The economy settles once per "day"; ticks in between only run the physical
// sim (power/water/jobs). For now a day is a bare counter. Later: surface a
// visible day number + an end-of-day budget sheet (SimCity-style revenue /
// expense breakdown).
export const TICKS_PER_DAY = 8;

// Bulldozing hands back this fraction of the build cost — the escape hatch from
// a broke/over-built city: raze, recover some cash, rebuild. Less than 1 so
// overbuilding still stings.
export const DEMOLISH_REFUND = 0.5;

// --- Tuning knobs. This table IS the game's balance. ---
// Everything interesting lives here; tweak numbers, not logic.
// Only utilities carry `upkeep` — houses and stores are the tax base, never a
// drain (SimCity's model: residential/commercial pay taxes, they don't bill).
export const CONFIG = {
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
		// people (capped by total population), earning `taxPerCustomer` each
		// per day. Tax is fixed for now. Later: expose it as a player-set rate
		// slider — the core income-vs-growth dial, where a higher rate raises
		// revenue but suppresses demand/growth.
		customersServed: 4,
		taxPerCustomer: 6,
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
