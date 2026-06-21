import "./Tile.css";
import { For, Show } from "solid-js";
import { StatCard } from "@/components/ui/StatCard";
import { Tooltip } from "@/components/ui/Tooltip";
import {
	buildingIssues,
	isBuildingOnline,
	type ResolvedBuilding,
} from "@/game/resolve";
import type { BuildingType } from "@/game/state";
import { ISSUE_META, tileAlerts, tileStats } from "./Tile.helpers";

const LETTERS: Record<BuildingType, string> = {
	house: "H",
	store: "S",
	power: "P",
	water: "W",
};

const LABELS: Record<BuildingType, string> = {
	house: "House",
	store: "Store",
	power: "Power plant",
	water: "Water plant",
};

export function Tile(props: {
	pos: number;
	building: ResolvedBuilding | undefined;
	onClick: (pos: number) => void;
}) {
	// A function, not a stored element: each branch below must create its OWN
	// button node. Reusing a single JSX-element variable across both arms of the
	// conditional teleports the one node between them when a cell toggles
	// empty↔filled, which leaves Kobalte's tooltip trigger span empty.
	const tileButton = () => {
		const issues = () => (props.building ? buildingIssues(props.building) : []);

		return (
			<button
				type="button"
				class="tile"
				data-type={props.building?.type ?? "empty"}
				data-offline={
					props.building && !isBuildingOnline(props.building) ? "true" : "false"
				}
				onClick={() => props.onClick(props.pos)}
			>
				{props.building?.type ? LETTERS[props.building.type] : ""}
				<Show when={issues().length > 0}>
					<span class="tile-badges">
						<For each={issues()}>
							{(issue) => (
								<span class="tile-badge">{ISSUE_META[issue].icon}</span>
							)}
						</For>
					</span>
				</Show>
			</button>
		);
	};

	// Empty cells carry no stats, so they get no tooltip — only placed buildings
	// are wrapped, mirroring how the toolbar wraps its tool buttons.
	return (
		<Show when={props.building} fallback={tileButton()}>
			{(bld) => (
				<Tooltip
					content={
						<StatCard
							title={LABELS[bld().type]}
							lines={tileStats(bld())}
							alerts={tileAlerts(bld())}
						/>
					}
				>
					{tileButton()}
				</Tooltip>
			)}
		</Show>
	);
}
