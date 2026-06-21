import "./Hud.css";
import type { CityStats } from "@/game/selectors";
import { Money } from "./Money";
import { TimeControl } from "./TimeControl";

export function Hud(props: {
	stats: CityStats;
	speed: number;
	onSpeed: (speed: number) => void;
	onReset: () => void;
}) {
	return (
		<div class="hud">
			<TimeControl
				day={props.stats.day}
				dayProgress={props.stats.dayProgress}
				speed={props.speed}
				onSpeed={props.onSpeed}
			/>
			<Money money={props.stats.money} dailyBudget={props.stats.dailyBudget} />
			<span class="hud-item">
				<span class="hud-label">PWR</span>
				{props.stats.powerSupply}/{props.stats.powerDemand}
			</span>
			<span class="hud-item">
				<span class="hud-label">H₂O</span>
				{props.stats.waterSupply}/{props.stats.waterDemand}
			</span>
			<span class="hud-item">
				<span class="hud-label">POP</span>
				{props.stats.population}
			</span>
			<span class="hud-item">
				<span class="hud-label">JOBS</span>
				{props.stats.jobs}
			</span>
			<button type="button" class="hud-reset" onClick={() => props.onReset()}>
				Reset
			</button>
		</div>
	);
}
