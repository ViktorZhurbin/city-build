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
