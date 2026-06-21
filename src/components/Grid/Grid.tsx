import "./Grid.css";
import { Index } from "solid-js";
import { Tile } from "@/components/Grid/Tile";
import { CELL_COUNT, GRID_SIZE } from "@/game/balance";
import type { ResolvedBuilding } from "@/game/resolve";
import type { Tool } from "@/game/types";

export function Grid(props: {
	cells: (ResolvedBuilding | undefined)[];
	selected: Tool | null;
	onTileClick: (pos: number) => void;
}) {
	return (
		<div
			class="grid"
			// Drives the empty-tile hover affordance: no tool selected → no hover,
			// otherwise the hover tint matches the selected building's colour.
			data-selected={props.selected ?? "none"}
			style={{ "--grid-size": GRID_SIZE }}
		>
			<Index each={Array.from({ length: CELL_COUNT })}>
				{(_, i) => (
					<Tile pos={i} building={props.cells[i]} onClick={props.onTileClick} />
				)}
			</Index>
		</div>
	);
}
