import type { City } from "@/game/state";

// The whole city is one small JSON blob — plain localStorage is plenty, no DB
// needed. The version suffix is bumped whenever the City shape changes
// incompatibly, so stale saves are ignored rather than loaded into a mismatched
// schema. v2: buildings are normalized ({ ids, entities }) and carry no sim flags.
const STORAGE_KEY = "city-build-it:v2";

export function saveCity(city: City): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
	} catch {
		// Private mode / quota — saving is best-effort, never block the game.
	}
}

export function clearCity(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Best-effort; ignore storage errors.
	}
}

export function loadCity(): City | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as City;
		const buildings = parsed.buildings;
		const looksValid =
			typeof parsed.money === "number" &&
			typeof parsed.tick === "number" &&
			!!buildings &&
			Array.isArray(buildings.ids) &&
			!!buildings.entities &&
			typeof buildings.entities === "object";

		return looksValid ? parsed : null;
	} catch {
		return null;
	}
}
