import { BUILDINGS, DEMOLISH_REFUND, TICKS_PER_DAY } from "@/game/balance";
import { resolve } from "@/game/resolve";
import {
	addOne,
	type BuildingType,
	type City,
	has,
	removeOne,
} from "@/game/state";

// The write path: the only functions that produce a new City. Each is a pure
// transition — `(City, …args) → City`. `place`/`demolish` are player commands;
// `tick` is the clock.

export function place(city: City, type: BuildingType, pos: number): City {
	const cellOccupied = has(city.buildings, pos);
	const building = BUILDINGS[type];

	if (cellOccupied || city.money < building.cost) {
		return city;
	}

	return {
		...city,
		money: city.money - building.cost,
		buildings: addOne(city.buildings, { type, pos }),
	};
}

// Remove a building, refunding a fraction of its cost. The refund is the escape
// hatch from a broke/over-built city (raze, recover cash, rebuild); being below
// 1 keeps overbuilding a net loss.
export function demolish(city: City, pos: number): City {
	const building = city.buildings.entities[pos];

	if (!building) {
		return city;
	}

	const refund = Math.floor(BUILDINGS[building.type].cost * DEMOLISH_REFUND);

	return {
		...city,
		money: city.money + refund,
		buildings: removeOne(city.buildings, pos),
	};
}

// The clock. Most ticks only advance the counter — the physical sim is derived
// (via `resolve`) wherever it's read, not stored here. The budget settles ONCE
// per day: on the boundary we resolve the city and apply revenue − upkeep.
// (Later: loans — borrow now against future days, repaid with interest here.)
export function tick(city: City): City {
	const nextTick = city.tick + 1;
	const dayElapsed = nextTick % TICKS_PER_DAY === 0;

	if (!dayElapsed) {
		return { ...city, tick: nextTick };
	}

	const { totals } = resolve(city.buildings);

	return {
		...city,
		tick: nextTick,
		money: city.money + totals.revenue - totals.upkeep,
	};
}
