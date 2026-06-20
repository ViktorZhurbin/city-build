import type { City } from "../types";

// The whole city is one small JSON blob — plain localStorage is plenty, no DB
// needed. Bump the version suffix if the City shape changes incompatibly, so
// stale saves are ignored rather than loaded into a mismatched schema.
const STORAGE_KEY = "city-build-it:v1";

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
		const looksValid =
			typeof parsed.money === "number" &&
			typeof parsed.tick === "number" &&
			Array.isArray(parsed.buildings);

		return looksValid ? parsed : null;
	} catch {
		return null;
	}
}
