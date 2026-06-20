export type BuildingType = "house" | "store" | "power" | "water";
interface Building {
	type: BuildingType;
	powered: boolean; // computed each tick — did supply reach it?
	watered: boolean;
	active: boolean; // a store is "active" only if powered, watered AND staffed
}
export interface City {
	money: number;
	buildings: Building[];
}
