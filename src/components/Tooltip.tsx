import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip";
import type { JSX } from "solid-js";
import "./Tooltip.css";

// Thin wrapper over Kobalte's headless Tooltip: it owns positioning, focus and
// dismissal; we own all the styling (in Tooltip.css) so it matches the tile /
// toolbar look. The trigger is rendered as a span so it can wrap an already-
// interactive element (e.g. a toolbar button) without nesting buttons.
export function Tooltip(props: {
	content: JSX.Element;
	children: JSX.Element;
}) {
	return (
		<KobalteTooltip>
			<KobalteTooltip.Trigger as="span" class="tooltip-trigger">
				{props.children}
			</KobalteTooltip.Trigger>

			<KobalteTooltip.Portal>
				<KobalteTooltip.Content class="tooltip-content">
					<KobalteTooltip.Arrow class="tooltip-arrow" />
					{props.content}
				</KobalteTooltip.Content>
			</KobalteTooltip.Portal>
		</KobalteTooltip>
	);
}

export interface StatLine {
	label: string;
	value: string;
}

// The shared tooltip body: a title over a list of label/value rows. Both the
// toolbar (static CONFIG figures) and the tiles (live per-building numbers) feed
// it, so the look stays identical wherever stats are surfaced.
export function StatCard(props: { title: string; lines: StatLine[] }) {
	return (
		<div class="tooltip-stats">
			<div class="tooltip-title">{props.title}</div>
			{props.lines.map((line) => (
				<div class="tooltip-row">
					<span class="tooltip-label">{line.label}</span>
					<span class="tooltip-value">{line.value}</span>
				</div>
			))}
		</div>
	);
}
