import "./Hud.css";
import { Progress } from "@kobalte/core/progress";
import { ToggleGroup } from "@kobalte/core/toggle-group";
import { Index } from "solid-js";
import type { CityStats } from "@/game/selectors";

const SPEEDS: { value: number; label: string }[] = [
	{ value: 0, label: "❚❚" },
	{ value: 1, label: "1×" },
	{ value: 2, label: "2×" },
	{ value: 3, label: "3×" },
];

export function Hud(props: {
	stats: CityStats;
	speed: number;
	onSpeed: (speed: number) => void;
	onReset: () => void;
}) {
	return (
		<div class="hud">
			<span class="hud-item">
				<span class="hud-label">DAY</span>
				{props.stats.day}
				<Progress
					as="span"
					class="hud-day"
					value={props.stats.dayProgress * 100}
				>
					<Progress.Track as="span" class="hud-day-bar">
						<Progress.Fill as="span" class="hud-day-fill" />
					</Progress.Track>
				</Progress>
			</span>
			<span class="hud-item">
				<span class="hud-label">$</span>
				{props.stats.money}
			</span>
			<span class="hud-item">
				<span class="hud-label">$/DAY</span>
				{props.stats.dailyBudget >= 0
					? `+${props.stats.dailyBudget}`
					: props.stats.dailyBudget}
			</span>
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
			<span class="hud-speed">
				<span class="hud-label">SPEED</span>
				<ToggleGroup
					as="span"
					class="hud-speed-btns"
					value={String(props.speed)}
					onChange={(value) => {
						// Single-select toggle groups emit null when the active item is
						// re-clicked; speed must always have a value, so ignore that.
						if (value !== null) {
							props.onSpeed(Number(value));
						}
					}}
				>
					<Index each={SPEEDS}>
						{(option) => (
							<ToggleGroup.Item
								class="hud-speed-btn"
								value={String(option().value)}
							>
								{option().label}
							</ToggleGroup.Item>
						)}
					</Index>
				</ToggleGroup>
			</span>
			<button type="button" class="hud-reset" onClick={() => props.onReset()}>
				Reset
			</button>
		</div>
	);
}
