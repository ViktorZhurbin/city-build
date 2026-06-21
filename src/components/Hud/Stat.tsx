import "./Stat.css";
import type { JSX } from "solid-js";

// The shared HUD pill: a leading icon + its value, with optional trailing
// content on the right (e.g. Money's daily-budget delta). The icon sits in its
// own slot so a text symbol now can become an SVG later without touching this.
export function Stat(props: {
	icon: JSX.Element;
	value: JSX.Element;
	children?: JSX.Element;
}) {
	return (
		<span class="stat">
			<span class="stat-main">
				<span class="stat-icon">{props.icon}</span>
				{props.value}
			</span>
			{props.children}
		</span>
	);
}
