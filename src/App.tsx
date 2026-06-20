import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import "./App.css";
import { CELL_COUNT, STARTING_MONEY } from "./CONFIG";
import { Grid } from "./components/Grid";
import { Hud } from "./components/Hud";
import { Toolbar } from "./components/Toolbar";
import { demolish, place } from "./logic/place";
import { stats } from "./logic/stats";
import { clearCity, loadCity, saveCity } from "./logic/storage";
import { tick } from "./logic/tick";
import type { Building, City, Tool } from "./types";

const freshCity = (): City => ({
	money: STARTING_MONEY,
	buildings: [],
	tick: 0,
});

const App = () => {
	const [city, setCity] = createStore<City>(loadCity() ?? freshCity());

	// Persist on every change. JSON.stringify reads each store property, so the
	// effect re-runs whenever any of them updates — ticks, placements, money.
	createEffect(() => saveCity(city));

	const [selected, setSelected] = createSignal<Tool | null>(null);

	// Tick speed as a multiplier; 0 means paused. Drives the sim interval below.
	const [speed, setSpeed] = createSignal(1);
	const BASE_TICK_MS = 1500;

	const cells = createMemo<(Building | undefined)[]>(() => {
		const slots: (Building | undefined)[] = new Array(CELL_COUNT);

		for (const b of city.buildings) {
			slots[b.pos] = b;
		}

		return slots;
	});

	const cityStats = createMemo(() => stats(city));

	// Re-runs whenever speed changes: clears the old interval (via onCleanup) and
	// starts one at the new rate, or none at all when paused.
	createEffect(() => {
		const currentSpeed = speed();
		if (currentSpeed === 0) return;

		const id = setInterval(() => {
			setCity(reconcile(tick(unwrap(city)), { key: "pos" }));
		}, BASE_TICK_MS / currentSpeed);
		onCleanup(() => clearInterval(id));
	});

	function handleReset() {
		clearCity();
		setCity(reconcile(freshCity(), { key: "pos" }));
		setSelected(null);
	}

	function handleTileClick(pos: number) {
		const tool = selected();

		if (!tool) return;

		const current = unwrap(city);
		const next =
			tool === "demolish" ? demolish(current, pos) : place(current, tool, pos);

		if (next !== current) {
			setCity(reconcile(next, { key: "pos" }));
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
			<Toolbar
				selected={selected()}
				money={city.money}
				onSelect={setSelected}
			/>
			<Grid
				cells={cells()}
				selected={selected()}
				onTileClick={handleTileClick}
			/>
		</div>
	);
};

export default App;
