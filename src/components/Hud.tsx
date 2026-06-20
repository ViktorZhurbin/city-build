import "./Hud.css";
import type { CityStats } from "../logic/stats";

export function Hud(props: { stats: CityStats; onReset: () => void }) {
	const cityStats = () => props.stats;

	return (
		<div class="hud">
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
			<button type="button" class="hud-reset" onClick={() => props.onReset()}>
				Reset
			</button>
		</div>
	);
}
