// The durable, persisted truth of a city. Everything else (powered/watered/
// staffed, revenue, totals) is *derived* from this by `resolve` — never stored
// here. Keeping state to the bare facts is what lets the read and write paths
// share one set of rules instead of each re-deriving them.

export type BuildingType = "house" | "store" | "power" | "water";

// A placed building, durable facts only. `pos` is the grid cell index and also
// doubles as the entity id (see `Buildings` below). No transient sim flags live
// on it — those belong to `ResolvedBuilding` in resolve.ts.
export interface Building {
	type: BuildingType;
	pos: number;
}

// The buildings collection, normalized (EntityAdapter-lite): `ids` gives the
// placement order — load-bearing, since power/water/jobs/customers are all
// allocated greedily in this order — and `entities` gives O(1) lookup by cell.
// `ids` is NEVER sorted; insertion order IS placement order.
export interface Buildings {
	ids: number[];
	entities: Record<number, Building>;
}

export interface City {
	money: number;
	tick: number; // ticks elapsed; the budget settles every TICKS_PER_DAY
	buildings: Buildings;
}

export const emptyBuildings = (): Buildings => ({ ids: [], entities: {} });

// Is a cell already occupied? The membership check place() guards with.
export const has = (buildings: Buildings, pos: number): boolean =>
	pos in buildings.entities;

// Add one building at the end of the order (latest placement is served last).
// Caller guarantees the cell is free (place() checks `has` first).
export const addOne = (
	buildings: Buildings,
	building: Building,
): Buildings => ({
	ids: [...buildings.ids, building.pos],
	entities: { ...buildings.entities, [building.pos]: building },
});

// Remove the building at `pos`, preserving the order of the rest.
export const removeOne = (buildings: Buildings, pos: number): Buildings => {
	const { [pos]: removed, ...rest } = buildings.entities;

	return {
		ids: buildings.ids.filter((id) => id !== pos),
		entities: rest,
	};
};

// All buildings in placement order — the iteration order every greedy pass uses.
export const selectAll = (buildings: Buildings): Building[] =>
	buildings.ids.map((id) => buildings.entities[id]);
