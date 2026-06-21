import "./App.css";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import { Grid } from "@/components/Grid/Grid";
import { Hud } from "@/components/Hud/Hud";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { STARTING_MONEY, TICK_MS } from "@/game/balance";
import { demolish, place, tick } from "@/game/reducers";
import { resolve } from "@/game/resolve";
import { toCells, toCityStats } from "@/game/selectors";
import { type City, emptyBuildings } from "@/game/state";
import { clearCity, loadCity, saveCity } from "@/game/storage";
import type { Tool } from "@/game/types";

const freshCity = (): City => ({
	tick: 0,
	money: STARTING_MONEY,
	buildings: emptyBuildings(),
});

const App = () => {
	const [city, setCity] = createStore<City>(loadCity() ?? freshCity());

	// Persist on every change. JSON.stringify reads each store property, so the
	// effect re-runs whenever any of them updates — ticks, placements, money.
	createEffect(() => saveCity(city));

	const [selected, setSelected] = createSignal<Tool | null>(null);

	// Tick speed as a multiplier; 0 means paused. Drives the sim interval below.
	const [speed, setSpeed] = createSignal(1);

	// One resolved snapshot per change drives everything downstream — the HUD
	// totals, the per-cell buildings, and tick's money settle. createMemo is the
	// selector cache, so the sim resolves at most once per change.
	const resolved = createMemo(() => resolve(city.buildings));

	const cityStats = createMemo(() => toCityStats(resolved(), city));

	// Cell-indexed buildings, each fully resolved (flags + live numbers), so a
	// tile reads everything it needs — including its tooltip stats — from one
	// object.
	const cells = createMemo(() => toCells(resolved()));

	// Re-runs whenever speed changes: clears the old interval (via onCleanup) and
	// starts one at the new rate, or none at all when paused.
	createEffect(() => {
		if (speed() === 0) return;

		const id = setInterval(() => {
			setCity(reconcile(tick(unwrap(city))));
		}, TICK_MS / speed());

		onCleanup(() => clearInterval(id));
	});

	function handleReset() {
		clearCity();
		setCity(reconcile(freshCity()));
		setSelected(null);
	}

	function handleTileClick(pos: number) {
		const tool = selected();

		if (!tool) return;

		const current = unwrap(city);

		const next =
			tool === "demolish" ? demolish(current, pos) : place(current, tool, pos);

		if (next !== current) {
			setCity(reconcile(next));
			// Placing deselects (one building per pick); the bulldozer stays armed
			// so you can clear several tiles in a row.
			if (tool !== "demolish") setSelected(null);
		}
	}

	return (
		<div class="app">
			<Hud
				stats={cityStats()}
				speed={speed()}
				onSpeed={setSpeed}
				onReset={handleReset}
			/>
			<Grid
				cells={cells()}
				selected={selected()}
				onTileClick={handleTileClick}
			/>
			<Toolbar
				money={city.money}
				selected={selected()}
				onSelect={setSelected}
			/>
		</div>
	);
};

export default App;
