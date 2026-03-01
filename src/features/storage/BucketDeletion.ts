import { Effect, Fiber, Scope, SubscriptionRef } from "effect";

import type { RouteContext } from "@/app/router.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import type { DeleteBucketStatus } from "./storageState.js";
import * as storageState from "./storageState.js";

export function makeDeleteBucketHandler(
	credentials: KnownCredentialsState["credentials"],
	runtimeFactory: RouteContext["runtimeFactory"],
	refreshBuckets: Effect.Effect<void>,
): Effect.Effect<(id: string) => void, never, Scope.Scope> {
	return Effect.gen(function* () {
		const pendingDeletes: Fiber.RuntimeFiber<void, never>[] = [];

		yield* Effect.addFinalizer(() =>
			Effect.forEach(pendingDeletes, (f) => Fiber.interrupt(f), {
				discard: true,
			}),
		);

		return (id: string) => {
			pendingDeletes.push(
				Effect.runFork(
					Effect.gen(function* () {
						const statusRef =
							yield* SubscriptionRef.make<DeleteBucketStatus>("idle");
						const status = yield* storageState.deleteBucket(
							id,
							credentials,
							runtimeFactory,
							statusRef,
						);
						if (status === "success") yield* refreshBuckets;
					}),
				),
			);
		};
	});
}
