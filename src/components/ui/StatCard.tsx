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
		<div class="statcard">
			<div class="statcard-title">{props.title}</div>
			{props.lines.map((line) => (
				<div class="statcard-row">
					<span class="statcard-label">{line.label}</span>
					<span class="statcard-value">{line.value}</span>
				</div>
			))}
		</div>
	);
}
