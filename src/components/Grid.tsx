import "./Grid.css";
import { Index } from "solid-js";
import { CELL_COUNT, GRID_SIZE } from "../CONFIG";
import type { Building, Tool } from "../types";
import { Tile } from "./Tile";

export function Grid(props: {
	cells: (Building | undefined)[];
	selected: Tool | null;
	onTileClick: (pos: number) => void;
}) {
	return (
		<div
			class="grid"
			// Drives the empty-tile hover affordance: no tool selected → no hover,
			// otherwise the hover tint matches the selected building's colour.
			data-selected={props.selected ?? "none"}
			style={{ "grid-template-columns": `repeat(${GRID_SIZE}, 2.5rem)` }}
		>
			<Index each={Array.from({ length: CELL_COUNT })}>
				{(_, i) => (
					<Tile pos={i} building={props.cells[i]} onClick={props.onTileClick} />
				)}
			</Index>
		</div>
	);
}
