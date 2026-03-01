import { Effect, Fiber, Scope } from "effect";

export type Panel = {
	show: (effect: Effect.Effect<void, never, Scope.Scope>) => void;
	hide: () => void;
};

export function makePanel(): Effect.Effect<Panel, never, Scope.Scope> {
	return Effect.gen(function* () {
		let fiber: Fiber.RuntimeFiber<void, never> | null = null;

		yield* Effect.addFinalizer(() =>
			fiber ? Fiber.interrupt(fiber) : Effect.void,
		);

		return {
			show: (effect: Effect.Effect<void, never, Scope.Scope>) => {
				if (!fiber) fiber = Effect.runFork(effect.pipe(Effect.scoped));
			},
			hide: () => {
				if (fiber) {
					Effect.runFork(Fiber.interrupt(fiber));
					fiber = null;
				}
			},
		};
	});
}
