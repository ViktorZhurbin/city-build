import { Index } from "solid-js";
import "./StatCard.css";

export interface StatLine {
	label: string;
	value: string;
}

// The shared tooltip body: a title over a list of label/value rows. Both the
// toolbar (static CONFIG figures) and the tiles (live per-building numbers) feed
// it, so the look stays identical wherever stats are surfaced.
export function StatCard(props: { title: string; lines: StatLine[] }) {
	return (
		<div>
			<div class="stat-card-title">{props.title}</div>
			<Index each={props.lines}>
				{(line) => (
					<div class="stat-card-row">
						<span class="stat-card-label">{line().label}</span>
						<span class="stat-card-value">{line().value}</span>
					</div>
				)}
			</Index>
		</div>
	);
}
