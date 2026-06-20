import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import "./App.css";
import { CELL_COUNT, STARTING_MONEY } from "./CONFIG";
import { Grid } from "./components/Grid";
import { Hud } from "./components/Hud";
import { Toolbar } from "./components/Toolbar";
import { place } from "./logic/place";
import { stats } from "./logic/stats";
import { tick } from "./logic/tick";
import type { Building, BuildingType, City } from "./types";

const App = () => {
	const [city, setCity] = createStore<City>({
		money: STARTING_MONEY,
		buildings: [],
	});

	const [selected, setSelected] = createSignal<BuildingType | null>(null);

	const cells = createMemo<(Building | undefined)[]>(() => {
		const slots: (Building | undefined)[] = new Array(CELL_COUNT);

		for (const b of city.buildings) {
			slots[b.pos] = b;
		}

		return slots;
	});

	const cityStats = createMemo(() => stats(city));

	onMount(() => {
		const id = setInterval(() => {
			setCity(reconcile(tick(unwrap(city)), { key: "pos" }));
		}, 1500);
		onCleanup(() => clearInterval(id));
	});

	function handleTileClick(pos: number) {
		const type = selected();

		if (!type) return;

		const current = unwrap(city);
		const next = place(current, type, pos);

		if (next !== current) {
			setCity(reconcile(next, { key: "pos" }));
			setSelected(null);
		}
	}

	return (
		<div class="app">
			<Hud stats={cityStats()} />
			<Toolbar selected={selected()} onSelect={setSelected} />
			<Grid cells={cells()} onTileClick={handleTileClick} />
		</div>
	);
};

export default App;
