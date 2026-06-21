import "./Tile.css";
import { CONFIG } from "../../CONFIG";
import type { ResolvedBuilding } from "../../game/resolve";
import { StatCard, type StatLine } from "../ui/StatCard";
import { Tooltip } from "../ui/Tooltip";

const LETTERS: Record<string, string> = {
	house: "H",
	store: "S",
	power: "P",
	water: "W",
};

const LABELS: Record<string, string> = {
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
	const building = () => props.building;

	const dark = () => {
		const bld = building();

		return !!bld && !(bld.powered && bld.watered);
	};

	// A function, not a stored element: each branch below must create its OWN
	// button node. Reusing a single JSX-element variable across both arms of the
	// conditional teleports the one node between them when a cell toggles
	// empty↔filled, which leaves Kobalte's tooltip trigger span empty.
	const tileButton = () => (
		<button
			type="button"
			class="tile"
			data-type={building()?.type ?? "empty"}
			data-dark={dark() ? "true" : "false"}
			onClick={() => props.onClick(props.pos)}
		>
			{building() ? LETTERS[building()?.type ?? ""] : ""}
		</button>
	);

	// Empty cells carry no stats, so they get no tooltip — only placed buildings
	// are wrapped, mirroring how the toolbar wraps its tool buttons.
	return (
		<>
			{building() ? (
				<Tooltip
					content={
						<StatCard
							title={LABELS[building()?.type ?? ""]}
							// biome-ignore lint/style/noNonNullAssertion: guarded by building()
							lines={tileStats(building()!)}
						/>
					}
				>
					{tileButton()}
				</Tooltip>
			) : (
				tileButton()
			)}
		</>
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

	const config = CONFIG[building.type];

	switch (building.type) {
		case "house":
			lines.push({ label: "Population", value: `+${building.population}` });
			break;
		case "store":
			lines.push({ label: "Jobs needed", value: `${CONFIG.store.jobsNeeded}` });
			lines.push({ label: "Customers", value: `${building.customers}` });
			lines.push({ label: "Revenue", value: `$${building.revenue}/day` });
			lines.push({
				label: "Tax / customer",
				value: `$${CONFIG.store.taxPerCustomer}`,
			});
			break;
		case "power":
			lines.push({
				label: "Power supply",
				value: `+${CONFIG.power.powerSupply}`,
			});
			break;
		case "water":
			lines.push({
				label: "Water supply",
				value: `+${CONFIG.water.waterSupply}`,
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
