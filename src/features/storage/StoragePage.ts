import { Effect, Scope, SubscriptionRef } from "effect";

import { Navigation, type NavigationService } from "@/app/navigation.js";
import type { RouteContext } from "@/app/router.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { mountBucketCreation } from "./BucketCreation.js";
import { makeDeleteBucketHandler } from "./BucketDeletion.js";
import { mountBucketsList } from "./BucketsList.js";
import { buildStoragePageView } from "./StoragePageView.js";
import type { BucketsState } from "./storageState.js";
import * as storageState from "./storageState.js";

export const storageRoute = {
	path: "/storage",
	redirect: (ctx: RouteContext) => {
		if (ctx.credentialsStore.getSnapshot().status === "unknown")
			return "/credentials";
		return null;
	},
	mount: (container: Element, ctx: RouteContext) =>
		mountStoragePage(container, ctx),
};

function mountStoragePage(
	container: Element,
	ctx: RouteContext,
): Effect.Effect<void, never, Scope.Scope | NavigationService> {
	return Effect.gen(function* () {
		const nav = yield* Navigation;
		const escapedRuntime = yield* Effect.runtime<
			Scope.Scope | NavigationService
		>();

		// redirect guarantees status === "known"
		const snap = ctx.credentialsStore.getSnapshot() as KnownCredentialsState;
		const credentials = snap.credentials;

		const bucketsStateRef = yield* SubscriptionRef.make<BucketsState>({
			status: "loading",
		});
		const refreshBuckets = storageState.loadBuckets(
			credentials,
			ctx.runtimeFactory,
			bucketsStateRef,
		);

		const { bucketActionsSlot, listContainer } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildStoragePageView();
				container.appendChild(view.outer);
				return view;
			}),
			({ outer }) => Effect.sync(() => outer.remove()),
		);

		yield* mountBucketCreation(
			bucketActionsSlot,
			credentials,
			ctx.runtimeFactory,
			refreshBuckets,
		);

		const onDeleteBucket = yield* makeDeleteBucketHandler(
			credentials,
			ctx.runtimeFactory,
			refreshBuckets,
		);

		yield* mountBucketsList(listContainer, bucketsStateRef, onDeleteBucket);

		yield* Effect.forkScoped(refreshBuckets);

		yield* Effect.never;
	});
}
