import "./Toolbar.css";
import { CONFIG } from "../CONFIG";
import type { BuildingType, Tool } from "../types";

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
			{BUILDING_TYPES.map((type) => {
				const unaffordable = () => CONFIG[type].cost > props.money;

				return (
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
				);
			})}
			<button
				type="button"
				class="tool-btn tool-btn-demolish"
				data-active={props.selected === "demolish" ? "true" : "false"}
				onClick={() => toggle("demolish")}
			>
				Demolish
			</button>
		</div>
	);
}
