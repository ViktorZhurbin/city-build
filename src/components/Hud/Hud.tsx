import "./Hud.css";
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
				<span class="hud-day-bar">
					<span
						class="hud-day-fill"
						style={{ width: `${props.stats.dayProgress * 100}%` }}
					/>
				</span>
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
				<span class="hud-speed-btns">
					<Index each={SPEEDS}>
						{(option) => (
							<button
								type="button"
								class="hud-speed-btn"
								data-active={props.speed === option().value ? "true" : "false"}
								onClick={() => props.onSpeed(option().value)}
							>
								{option().label}
							</button>
						)}
					</Index>
				</span>
			</span>
			<button type="button" class="hud-reset" onClick={() => props.onReset()}>
				Reset
			</button>
		</div>
	);
}
