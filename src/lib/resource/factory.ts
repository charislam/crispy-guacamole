import { Effect } from "effect";

import { makeStore } from "./store";
import type { PendingResourceState, ResourceState } from "./types";

export const makeResource = <I, A, E>(
	load: (input: I) => Effect.Effect<A, E>,
) =>
	Effect.gen(function* () {
		const store = yield* makeStore<ResourceState<A, E>>({
			status: "idle",
			data: null,
			error: null,
		});

		const run = (input: I) =>
			Effect.gen(function* () {
				yield* store.update(
					(s) => ({ ...s, status: "pending" }) as PendingResourceState<A, E>,
				);

				const result = yield* Effect.either(load(input));

				yield* store.update(() => {
					if (result._tag === "Left") {
						return {
							status: "error",
							data: null,
							error: result.left,
						};
					}

					return {
						status: "ready",
						data: result.right,
						error: null,
					};
				});
			});

		return { store, run };
	});
