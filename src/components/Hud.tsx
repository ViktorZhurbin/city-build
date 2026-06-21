import "./Hud.css";
import type { CityStats } from "../game/selectors";

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
	const cityStats = () => props.stats;

	return (
		<div class="hud">
			<span class="hud-item">
				<span class="hud-label">DAY</span>
				{cityStats().day}
				<span class="hud-day-bar">
					<span
						class="hud-day-fill"
						style={{ width: `${cityStats().dayProgress * 100}%` }}
					/>
				</span>
			</span>
			<span class="hud-item">
				<span class="hud-label">$</span>
				{cityStats().money}
			</span>
			<span class="hud-item">
				<span class="hud-label">$/DAY</span>
				{cityStats().dailyBudget >= 0
					? `+${cityStats().dailyBudget}`
					: cityStats().dailyBudget}
			</span>
			<span class="hud-item">
				<span class="hud-label">PWR</span>
				{cityStats().powerSupply}/{cityStats().powerDemand}
			</span>
			<span class="hud-item">
				<span class="hud-label">H₂O</span>
				{cityStats().waterSupply}/{cityStats().waterDemand}
			</span>
			<span class="hud-item">
				<span class="hud-label">POP</span>
				{cityStats().population}
			</span>
			<span class="hud-item">
				<span class="hud-label">JOBS</span>
				{cityStats().jobs}
			</span>
			<span class="hud-speed">
				<span class="hud-label">SPEED</span>
				<span class="hud-speed-btns">
					{SPEEDS.map((option) => (
						<button
							type="button"
							class="hud-speed-btn"
							data-active={props.speed === option.value ? "true" : "false"}
							onClick={() => props.onSpeed(option.value)}
						>
							{option.label}
						</button>
					))}
				</span>
			</span>
			<button type="button" class="hud-reset" onClick={() => props.onReset()}>
				Reset
			</button>
		</div>
	);
}
