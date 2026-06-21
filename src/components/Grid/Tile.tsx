import "./Tile.css";
import { Show } from "solid-js";
import { StatCard, type StatLine } from "@/components/ui/StatCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { BUILDINGS } from "@/game/balance";
import { isOperable, type ResolvedBuilding } from "@/game/resolve";
import type { BuildingType } from "@/game/state";

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
		return (
			<button
				type="button"
				class="tile"
				data-type={props.building?.type ?? "empty"}
				data-dark={
					props.building && !isOperable(props.building) ? "true" : "false"
				}
				onClick={() => props.onClick(props.pos)}
			>
				{props.building?.type ? LETTERS[props.building.type] : ""}
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
						<StatCard title={LABELS[bld().type]} lines={tileStats(bld())} />
					}
				>
					{tileButton()}
				</Tooltip>
			)}
		</Show>
	);
}

// Live stat lines for one building. Static figures (draws, jobs, tax) come from
// CONFIG; the headline numbers the player cares about — population, served
// customers, revenue, upkeep — come straight off the resolved building, so they
// reflect its actual state (a dark house reads +0, an over-saturated store reads
// $0). No status line: "offline" is already the dimmed tile, and a stalled store
// reads as Customers 0 / Revenue $0.
function tileStats(building: ResolvedBuilding): StatLine[] {
	const lines: StatLine[] = [];

	const config = BUILDINGS[building.type];

	switch (building.type) {
		case "house":
			lines.push({ label: "Population", value: `+${building.population}` });
			break;
		case "store":
			lines.push({
				label: "Jobs needed",
				value: `${BUILDINGS.store.jobsNeeded}`,
			});
			lines.push({ label: "Customers", value: `${building.customers}` });
			lines.push({ label: "Revenue", value: `$${building.revenue}/day` });
			lines.push({
				label: "Tax / customer",
				value: `$${BUILDINGS.store.taxPerCustomer}`,
			});
			break;
		case "power":
			lines.push({
				label: "Power supply",
				value: `+${BUILDINGS.power.powerSupply}`,
			});
			break;
		case "water":
			lines.push({
				label: "Water supply",
				value: `+${BUILDINGS.water.waterSupply}`,
			});
			break;
	}

	if (config.powerUse > 0) {
		lines.push({ label: "Power use", value: `−${config.powerUse}` });
	}

	if (config.waterUse > 0) {
		lines.push({ label: "Water use", value: `−${config.waterUse}` });
	}

	if (building.upkeep > 0) {
		lines.push({ label: "Upkeep", value: `−$${building.upkeep}/day` });
	}

	return lines;
}
