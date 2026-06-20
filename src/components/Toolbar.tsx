import "./Toolbar.css";
import { CONFIG } from "../CONFIG";
import type { BuildingType } from "../types";

const BUILDING_TYPES: BuildingType[] = ["house", "store", "power", "water"];
const LABELS: Record<BuildingType, string> = {
	house: "House",
	store: "Store",
	power: "Power",
	water: "Water",
};

export function Toolbar(props: {
	selected: BuildingType | null;
	money: number;
	onSelect: (type: BuildingType | null) => void;
}) {
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
						onClick={() =>
							props.onSelect(props.selected === type ? null : type)
						}
					>
						{LABELS[type]}
						<span class="tool-cost">${CONFIG[type].cost}</span>
					</button>
				);
			})}
		</div>
	);
}
