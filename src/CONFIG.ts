export const GRID_SIZE = 10;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const STARTING_MONEY = 700;

// --- Tuning knobs. This table IS the game's balance. ---
// Everything interesting lives here; tweak numbers, not logic.
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
		profit: 12,
	},
	power: {
		cost: 200,
		powerUse: 0,
		waterUse: 0,
		powerSupply: 10,
	},
	water: {
		cost: 180,
		powerUse: 2,
		waterUse: 0,
		waterSupply: 10,
	},
} as const;
