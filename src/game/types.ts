import type { BuildingType } from "@/game/state";

// What the toolbar can have selected: a building to place, or the bulldozer.
// The domain types (BuildingType, Building, City) live in game/state.ts; this
// file holds only UI-level types.
export type Tool = BuildingType | "demolish";
