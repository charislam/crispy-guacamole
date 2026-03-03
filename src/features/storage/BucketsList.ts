import { Effect, Scope, Stream, SubscriptionRef } from "effect";

import { buildBucketsListView } from "./BucketsListView.js";
import type { BucketsState } from "./storageState.js";

export function mountBucketsList(
	container: Element,
	bucketsStateRef: SubscriptionRef.SubscriptionRef<BucketsState>,
	onDeleteBucket: (id: string) => void,
	onNavigateToBucket: (id: string) => void,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.gen(function* () {
		const view = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildBucketsListView(onDeleteBucket, onNavigateToBucket);
				container.appendChild(view.wrapper);
				return view;
			}),
			(view) =>
				Effect.sync(() => {
					view.cleanup();
					view.wrapper.remove();
				}),
		);

		yield* bucketsStateRef.changes.pipe(
			Stream.runForEach((state) => Effect.sync(() => view.render(state))),
			Effect.forkScoped,
		);
	});
}
