import "./Tile.css";
import type { Building } from "../types";

const LETTERS: Record<string, string> = {
	house: "H",
	store: "S",
	power: "P",
	water: "W",
};

export function Tile(props: {
	pos: number;
	building: Building | undefined;
	onClick: (pos: number) => void;
}) {
	const building = () => props.building;

	const dark = () => {
		const bld = building();

		return !!bld && !(bld.powered && bld.watered);
	};

	return (
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
}
