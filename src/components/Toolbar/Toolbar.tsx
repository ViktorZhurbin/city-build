import "./Toolbar.css";
import { ToggleGroup } from "@kobalte/core/toggle-group";
import { Index } from "solid-js";
import { StatCard, type StatLine } from "@/components/ui/StatCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { BUILDINGS, DEMOLISH_REFUND, TAX_RATE } from "@/game/balance";
import type { BuildingType } from "@/game/state";
import type { Tool } from "@/game/types";

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
	return (
		// One exclusive selection across all tools; re-clicking the active tool
		// emits null, which clears the selection (same as the old toggle).
		<ToggleGroup
			class="toolbar"
			value={props.selected}
			onChange={(value) => props.onSelect(value as Tool | null)}
		>
			<div class="toolbar-buildings">
				<Index each={BUILDING_TYPES}>
					{(type) => {
						const unaffordable = () => BUILDINGS[type()].cost > props.money;

						return (
							<Tooltip
								content={
									<StatCard
										title={LABELS[type()]}
										lines={buildingStats(type())}
									/>
								}
							>
								<ToggleGroup.Item
									class="tool-btn"
									data-type={type()}
									value={type()}
									disabled={unaffordable()}
								>
									{LABELS[type()]}
									<span class="tool-cost">${BUILDINGS[type()].cost}</span>
								</ToggleGroup.Item>
							</Tooltip>
						);
					}}
				</Index>
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
				<ToggleGroup.Item class="tool-btn tool-btn-demolish" value="demolish">
					Demolish
				</ToggleGroup.Item>
			</Tooltip>
		</ToggleGroup>
	);
}

// Reads the per-building tuning straight out of CONFIG so the tooltip never
// drifts from the numbers the sim actually runs on. Supplies are shown as +N,
// draws/costs as −N, so a glance tells you what a building gives vs. takes.
function buildingStats(type: BuildingType): StatLine[] {
	const lines: StatLine[] = [];

	switch (type) {
		case "house":
			lines.push({
				label: "Population",
				value: `+${BUILDINGS.house.population}`,
			});
			break;
		case "store":
			lines.push({
				label: "Jobs needed",
				value: `${BUILDINGS.store.jobsNeeded}`,
			});
			lines.push({
				label: "Customers",
				value: `${BUILDINGS.store.customersServed}`,
			});
			lines.push({
				label: "Tax / customer",
				value: `$${TAX_RATE}`,
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

	const config = BUILDINGS[type];

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
