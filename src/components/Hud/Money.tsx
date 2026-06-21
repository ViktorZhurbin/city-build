import "./Money.css";
import { Stat } from "./Stat";

export function Money(props: { money: number; dailyBudget: number }) {
	return (
		<Stat icon="$" value={props.money}>
			<span class="money-budget" data-trend={budgetTrend(props.dailyBudget)}>
				{props.dailyBudget > 0 ? `+${props.dailyBudget}` : props.dailyBudget}
			</span>
		</Stat>
	);
}

function budgetTrend(dailyBudget: number): "up" | "down" | "flat" {
	if (dailyBudget > 0) {
		return "up";
	}

	if (dailyBudget < 0) {
		return "down";
	}

	return "flat";
}
