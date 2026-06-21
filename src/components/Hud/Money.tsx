import "./Money.css";

export function Money(props: { money: number; dailyBudget: number }) {
	return (
		<span class="money">
			<span>${props.money}</span>
			<span class="money-budget" data-trend={budgetTrend(props.dailyBudget)}>
				{props.dailyBudget > 0 ? `+${props.dailyBudget}` : props.dailyBudget}
			</span>
		</span>
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
