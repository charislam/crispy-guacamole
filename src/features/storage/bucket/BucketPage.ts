import { Effect, Exit, Scope, Stream, SubscriptionRef } from "effect";

import type { NavigationService } from "@/app/navigation.js";
import type { RouteContext } from "@/app/router.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { loadBucketRoot, type BucketPageState } from "./bucketPageState.js";
import { buildBucketPageView } from "./BucketPageView.js";
import { mountFileTree } from "./FileTree.js";

export const bucketRoute = {
	path: "/storage/bucket/:bucketId",
	redirect: (ctx: RouteContext) => {
		if (ctx.credentialsStore.getSnapshot().status === "unknown")
			return "/credentials";
		return null;
	},
	mount: (
		container: Element,
		ctx: RouteContext,
		params: Record<string, string>,
	) => mountBucketPage(container, ctx, params.bucketId),
};

function mountBucketPage(
	container: Element,
	ctx: RouteContext,
	bucketId: string,
): Effect.Effect<void, never, Scope.Scope | NavigationService> {
	return Effect.gen(function* () {
		// redirect guarantees status === "known"
		const snap = ctx.credentialsStore.getSnapshot() as KnownCredentialsState;
		const credentials = snap.credentials;

		const pageStateRef = yield* SubscriptionRef.make<BucketPageState>({
			status: "loading",
		});

		const { treeContainer, show } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildBucketPageView(bucketId);
				container.appendChild(view.outer);
				return view;
			}),
			({ outer }) => Effect.sync(() => outer.remove()),
		);

		let treeScope: Scope.CloseableScope | null = null;

		yield* Effect.addFinalizer(() =>
			treeScope ? Scope.close(treeScope, Exit.void) : Effect.void,
		);

		yield* pageStateRef.changes.pipe(
			Stream.runForEach((state) =>
				Effect.gen(function* () {
					if (treeScope) {
						yield* Scope.close(treeScope, Exit.void);
						treeScope = null;
						treeContainer.replaceChildren();
					}

					if (state.status === "loading") {
						show("loading");
					} else if (state.status === "error") {
						show("error");
					} else if (state.rootItems.length === 0) {
						show("empty");
					} else {
						show("ready");
						treeScope = yield* Scope.make();
						yield* Effect.provideService(
							mountFileTree(
								treeContainer,
								state.rootItems,
								bucketId,
								"",
								0,
								credentials,
								ctx.runtimeFactory,
							),
							Scope.Scope,
							treeScope,
						);
					}
				}),
			),
			Effect.forkScoped,
		);

		yield* Effect.forkScoped(
			loadBucketRoot(bucketId, credentials, ctx.runtimeFactory, pageStateRef),
		);

		yield* Effect.never;
	});
}
