import { Index, Show } from "solid-js";
import "./StatCard.css";

export interface StatLine {
	label: string;
	value: string;
}

export interface StatAlert {
	icon: string;
	text: string;
	severity: "offline" | "idle";
}

// The shared tooltip body: a title, any warning alerts, then a list of
// label/value rows. Both the toolbar (static CONFIG figures) and the tiles
// (live per-building numbers) feed it, so the look stays identical wherever
// stats are surfaced.
export function StatCard(props: {
	title: string;
	lines: StatLine[];
	alerts?: StatAlert[];
}) {
	return (
		<div>
			<div class="stat-card-title">{props.title}</div>
			<Show when={props.alerts?.length}>
				<div class="stat-card-alerts">
					<Index each={props.alerts}>
						{(alert) => (
							<div class="stat-card-alert" data-severity={alert().severity}>
								<span class="stat-card-alert-icon">{alert().icon}</span>
								<span>{alert().text}</span>
							</div>
						)}
					</Index>
				</div>
			</Show>
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
