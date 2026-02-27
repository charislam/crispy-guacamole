import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { makeStore } from "./store";

describe("makeStore", () => {
	it.effect("getSnapshot returns the initial value", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(42);
			expect(store.getSnapshot()).toBe(42);
		}),
	);

	it.effect("update changes the value returned by getSnapshot", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			yield* store.update(() => 99);
			expect(store.getSnapshot()).toBe(99);
		}),
	);

	it.effect("update passes current state to the updater function", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(10);
			yield* store.update((n) => n * 3);
			expect(store.getSnapshot()).toBe(30);
		}),
	);

	it.effect("applies updates sequentially", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			yield* store.update((n) => n + 1);
			yield* store.update((n) => n + 1);
			yield* store.update((n) => n + 1);
			expect(store.getSnapshot()).toBe(3);
		}),
	);

	it.effect("notifies subscriber after update", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			let notified = false;
			store.subscribe(() => {
				notified = true;
			});

			yield* store.update((n) => n + 1);
			yield* Effect.yieldNow();

			expect(notified).toBe(true);
		}),
	);

	it.effect("notifies all subscribers after update", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			const calls: number[] = [];
			store.subscribe(() => calls.push(1));
			store.subscribe(() => calls.push(2));
			store.subscribe(() => calls.push(3));

			yield* store.update((n) => n + 1);
			yield* Effect.yieldNow();

			expect(calls).toHaveLength(3);
		}),
	);

	it.effect("does not notify subscribers when state is unchanged", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			let callCount = 0;
			store.subscribe(() => {
				callCount++;
			});

			yield* store.update((n) => n);
			yield* Effect.yieldNow();

			expect(callCount).toBe(0);
		}),
	);

	it.effect(
		"does not notify subscribers when referentially equal object is returned",
		() =>
			Effect.gen(function* () {
				const obj = { value: 1 };
				const store = yield* makeStore(obj);
				let callCount = 0;
				store.subscribe(() => {
					callCount++;
				});

				yield* store.update((o) => o);
				yield* Effect.yieldNow();

				expect(callCount).toBe(0);
			}),
	);

	it.effect("unsubscribe stops future notifications", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			let callCount = 0;
			const unsubscribe = store.subscribe(() => {
				callCount++;
			});

			yield* store.update((n) => n + 1);
			yield* Effect.yieldNow();
			expect(callCount).toBe(1);

			unsubscribe();

			yield* store.update((n) => n + 1);
			yield* Effect.yieldNow();
			expect(callCount).toBe(1);
		}),
	);

	it.effect("unsubscribing one listener does not affect others", () =>
		Effect.gen(function* () {
			const store = yield* makeStore(0);
			let aCount = 0;
			let bCount = 0;
			const unsubscribeA = store.subscribe(() => {
				aCount++;
			});
			store.subscribe(() => {
				bCount++;
			});

			unsubscribeA();

			yield* store.update((n) => n + 1);
			yield* Effect.yieldNow();

			expect(aCount).toBe(0);
			expect(bCount).toBe(1);
		}),
	);
});
