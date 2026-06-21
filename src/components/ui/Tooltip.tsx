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
		// These tooltips are read-only stat cards, so we make them dismiss eagerly:
		// closeDelay 0 + ignoreSafeArea close the moment the cursor leaves the
		// trigger (even when moving toward the content), and pointer-events:none on
		// the content (in Tooltip.css) lets the cursor pass through rather than
		// hovering / selecting it or obscuring the UI behind.
		<KobalteTooltip closeDelay={0} ignoreSafeArea>
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
