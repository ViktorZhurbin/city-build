export type BuildingType = "house" | "store" | "power" | "water";
export interface Building {
	type: BuildingType;
	pos: number; // cell index 0..CELL_COUNT-1; stable identity, ignored by the sim
	powered: boolean; // computed each tick — did supply reach it?
	watered: boolean;
	active: boolean; // a store is "active" only if powered, watered AND staffed
}
export interface City {
	money: number;
	buildings: Building[];
}
