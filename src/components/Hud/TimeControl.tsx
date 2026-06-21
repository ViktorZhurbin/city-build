import "./TimeControl.css";
import { Progress } from "@kobalte/core/progress";

// Day 1 is this calendar date; each elapsed day advances it by one (the date
// flips on the same boundary the budget settles).
const START_DATE = new Date();

export function TimeControl(props: {
	day: number;
	dayProgress: number;
	speed: number;
	onSpeed: (speed: number) => void;
}) {
	// The speed to restore when un-pausing; captured at the moment we pause.
	let resumeSpeed = 1;

	const paused = () => props.speed === 0;

	const togglePause = () => {
		if (paused()) {
			props.onSpeed(resumeSpeed);
		} else {
			resumeSpeed = props.speed;
			props.onSpeed(0);
		}
	};

	const stepSpeed = () => {
		const next = props.speed >= 3 ? 1 : props.speed + 1;

		props.onSpeed(next);
	};

	return (
		<span class="time">
			<button
				type="button"
				class="time-btn"
				aria-label={paused() ? "Play" : "Pause"}
				onClick={togglePause}
			>
				{paused() ? "▶" : "❚❚"}
			</button>
			<span class="time-date">
				{formatDate(props.day)}
				<Progress
					as="span"
					class="time-progress"
					value={props.dayProgress * 100}
				>
					<Progress.Track as="span" class="time-progress-track">
						<Progress.Fill as="span" class="time-progress-fill" />
					</Progress.Track>
				</Progress>
			</span>
			<button
				type="button"
				class="time-btn"
				aria-label="Faster"
				onClick={stepSpeed}
			>
				<span class="time-chevrons" data-speed={props.speed}>
					<span>▶</span>
					<span>▶</span>
					<span>▶</span>
				</span>
			</button>
		</span>
	);
}

function formatDate(day: number): string {
	const date = new Date(START_DATE);
	date.setDate(date.getDate() + (day - 1));

	// Pin the locale so the order/separators are stable across runtimes; en-GB
	// gives the DD/MM/YYYY we want, padded.
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
