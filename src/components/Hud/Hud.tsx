import "./Hud.css";
import { Show } from "solid-js";
import type { CityStats } from "@/game/selectors";
import { Money } from "./Money";
import { Stat } from "./Stat";
import { TimeControl } from "./TimeControl";

export function Hud(props: {
	stats: CityStats;
	speed: number;
	onSpeed: (speed: number) => void;
	onReset: () => void;
}) {
	return (
		<div class="hud">
			<div class="hud-main">
				<TimeControl
					day={props.stats.day}
					dayProgress={props.stats.dayProgress}
					speed={props.speed}
					onSpeed={props.onSpeed}
				/>
				<Money
					money={props.stats.money}
					dailyBudget={props.stats.dailyBudget}
				/>
				<Stat icon="👥" value={props.stats.population} />
			</div>

			<Show when={import.meta.env.DEV}>
				<button type="button" class="hud-reset" onClick={() => props.onReset()}>
					Reset
				</button>
			</Show>
		</div>
	);
}
