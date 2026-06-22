import { BUILDINGS, TAX_RATE } from "@/game/balance";
import {
	type BuildingIssue,
	buildingIssues,
	type ResolvedBuilding,
} from "@/game/resolve";
import type { StatAlert, StatLine } from "../ui/StatCard";

// How each issue reads: the tile badge (also the alert icon) and the tooltip's
// "what + why" note. The rule for *which* issues a building has lives in
// `buildingIssues` (resolve.ts); a value is exactly one tooltip alert.
export const ISSUE_META: Record<BuildingIssue, StatAlert> = {
	power: {
		icon: "⚡",
		text: "No power — building is offline",
		severity: "offline",
	},
	water: {
		icon: "💧",
		text: "No water — building is offline",
		severity: "offline",
	},
	noWorkers: {
		icon: "💤",
		text: "No workers — not enough people to staff it",
		severity: "idle",
	},
	noCustomers: {
		icon: "💤",
		text: "No customers — shoppers are saturated",
		severity: "idle",
	},
};

// The warning alerts for one building, mapped from its derived issues. Empty
// for a healthy building, so the tooltip shows no alert block.
export function tileAlerts(building: ResolvedBuilding): StatAlert[] {
	return buildingIssues(building).map((issue) => ISSUE_META[issue]);
}
// Live stat lines for one building. Static figures (draws, jobs, tax) come from
// CONFIG; the headline numbers the player cares about — population, served
// customers, revenue, upkeep — come straight off the resolved building, so they
// reflect its actual state (an offline house reads +0, an over-saturated store reads
// $0). The *reason* for those zeros is carried by the alerts above (see
// tileAlerts), not repeated as a stat line.
export function tileStats(building: ResolvedBuilding): StatLine[] {
	const lines: StatLine[] = [];

	const config = BUILDINGS[building.type];

	switch (building.type) {
		case "house":
			lines.push({ label: "Population", value: `+${building.population}` });
			break;
		case "store":
			lines.push({
				label: "Jobs needed",
				value: `${BUILDINGS.store.jobsNeeded}`,
			});
			lines.push({ label: "Customers", value: `${building.customers}` });
			lines.push({ label: "Revenue", value: `$${building.revenue}/day` });
			lines.push({
				label: "Tax / customer",
				value: `$${TAX_RATE}`,
			});
			break;
		case "power":
			lines.push({
				label: "Power supply",
				value: `+${BUILDINGS.power.powerSupply}`,
			});
			break;
		case "water":
			lines.push({
				label: "Water supply",
				value: `+${BUILDINGS.water.waterSupply}`,
			});
			break;
	}

	if (config.powerUse > 0) {
		lines.push({ label: "Power use", value: `−${config.powerUse}` });
	}

	if (config.waterUse > 0) {
		lines.push({ label: "Water use", value: `−${config.waterUse}` });
	}

	if (building.upkeep > 0) {
		lines.push({ label: "Upkeep", value: `−$${building.upkeep}/day` });
	}

	return lines;
}
