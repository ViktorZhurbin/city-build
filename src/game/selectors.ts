import { CELL_COUNT, TICKS_PER_DAY } from "./balance";
import type { Resolved, ResolvedBuilding } from "./resolve";
import type { City } from "./state";

// The read path: thin projections of a `Resolved` snapshot into the exact shapes
// the views want. No rules live here — selectors only reshape what `resolve`
// already computed.

export interface CityStats {
	money: number;
	powerSupply: number;
	powerDemand: number;
	waterSupply: number;
	waterDemand: number;
	population: number;
	jobs: number;
	dailyBudget: number; // revenue − upkeep, applied once per day
	day: number; // 1-based; the day currently in progress
	dayProgress: number; // 0..1 toward the next budget settle
}

// The HUD model. `money` and `tick` come from the durable City; everything else
// is read straight off the resolved totals.
export const toCityStats = (resolved: Resolved, city: City): CityStats => {
	const { totals } = resolved;
	const { money, tick } = city;

	return {
		money,
		powerSupply: totals.powerSupply,
		powerDemand: totals.powerDemand,
		waterSupply: totals.waterSupply,
		waterDemand: totals.waterDemand,
		population: totals.population,
		jobs: totals.jobs,
		dailyBudget: totals.revenue - totals.upkeep,
		day: Math.floor(tick / TICKS_PER_DAY) + 1,
		dayProgress: (tick % TICKS_PER_DAY) / TICKS_PER_DAY,
	};
};

// The grid model: a cell-indexed sparse array (empty cells are undefined). Each
// filled cell carries its fully-resolved building, so a tile reads its flags
// (powered/watered) and live numbers (population/customers/revenue/upkeep) from
// one object — no separate per-tile stats lookup needed.
export const toCells = (
	resolved: Resolved,
): (ResolvedBuilding | undefined)[] => {
	const cells: (ResolvedBuilding | undefined)[] = new Array(CELL_COUNT);

	for (const pos of resolved.ids) {
		cells[pos] = resolved.entities[pos];
	}

	return cells;
};
