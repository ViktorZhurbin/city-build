import "./Grid.css";
import { Index } from "solid-js";
import { CELL_COUNT, GRID_SIZE } from "../CONFIG";
import type { Building } from "../types";
import { Tile } from "./Tile";

export function Grid(props: {
	cells: (Building | undefined)[];
	onTileClick: (pos: number) => void;
}) {
	return (
		<div
			class="grid"
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
