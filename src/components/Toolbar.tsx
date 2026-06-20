import "./Toolbar.css";
import { CONFIG, DEMOLISH_REFUND } from "../CONFIG";
import type { BuildingType, Tool } from "../types";
import { StatCard, type StatLine, Tooltip } from "./Tooltip";

const BUILDING_TYPES: BuildingType[] = ["house", "store", "power", "water"];
const LABELS: Record<BuildingType, string> = {
	house: "House",
	store: "Store",
	power: "Power",
	water: "Water",
};

export function Toolbar(props: {
	selected: Tool | null;
	money: number;
	onSelect: (tool: Tool | null) => void;
}) {
	const toggle = (tool: Tool) =>
		props.onSelect(props.selected === tool ? null : tool);

	return (
		<div class="toolbar">
			<div class="toolbar-buildings">
				{BUILDING_TYPES.map((type) => {
					const unaffordable = () => CONFIG[type].cost > props.money;

					return (
						<Tooltip
							content={
								<StatCard title={LABELS[type]} lines={buildingStats(type)} />
							}
						>
							<button
								type="button"
								class="tool-btn"
								data-type={type}
								data-active={props.selected === type ? "true" : "false"}
								disabled={unaffordable()}
								onClick={() => toggle(type)}
							>
								{LABELS[type]}
								<span class="tool-cost">${CONFIG[type].cost}</span>
							</button>
						</Tooltip>
					);
				})}
			</div>
			<Tooltip
				content={
					<StatCard
						title="Demolish"
						lines={[
							{
								label: "Refund",
								value: `${Math.round(DEMOLISH_REFUND * 100)}% of cost`,
							},
						]}
					/>
				}
			>
				<button
					type="button"
					class="tool-btn tool-btn-demolish"
					data-active={props.selected === "demolish" ? "true" : "false"}
					onClick={() => toggle("demolish")}
				>
					Demolish
				</button>
			</Tooltip>
		</div>
	);
}

// Reads the per-building tuning straight out of CONFIG so the tooltip never
// drifts from the numbers the sim actually runs on. Supplies are shown as +N,
// draws/costs as −N, so a glance tells you what a building gives vs. takes.
function buildingStats(type: BuildingType): StatLine[] {
	const lines: StatLine[] = [];

	switch (type) {
		case "house":
			lines.push({ label: "Population", value: `+${CONFIG.house.population}` });
			break;
		case "store":
			lines.push({ label: "Jobs needed", value: `${CONFIG.store.jobsNeeded}` });
			lines.push({
				label: "Customers",
				value: `${CONFIG.store.customersServed}`,
			});
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

	const config = CONFIG[type];

	if (config.powerUse > 0) {
		lines.push({ label: "Power use", value: `−${config.powerUse}` });
	}

	if (config.waterUse > 0) {
		lines.push({ label: "Water use", value: `−${config.waterUse}` });
	}

	if ("upkeep" in config) {
		lines.push({ label: "Upkeep", value: `−$${config.upkeep}/day` });
	}

	return lines;
}
