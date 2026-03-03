import { Effect, Runtime, Scope, Stream, SubscriptionRef } from "effect";

import { Navigation, type NavigationService } from "@/app/navigation.js";
import type { RouteContext } from "@/app/router.js";
import type { BucketsState } from "@/features/storage/storageState.js";
import * as storageState from "@/features/storage/storageState.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { buildHomePageView } from "./HomePageView.js";

export const homeRoute = {
	path: "/",
	redirect: (ctx: RouteContext) => {
		if (ctx.credentialsStore.getSnapshot().status === "unknown")
			return "/credentials";
		return null;
	},
	mount: (container: Element, ctx: RouteContext) =>
		mountHomePage(container, ctx),
};

function mountHomePage(
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

		const { viewStorageBtn, countEl } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildHomePageView();
				container.appendChild(view.outer);
				return view;
			}),
			({ outer }) => Effect.sync(() => outer.remove()),
		);

		viewStorageBtn.addEventListener("click", () => {
			Runtime.runFork(escapedRuntime)(nav.navigate("/storage"));
		});

		yield* bucketsStateRef.changes.pipe(
			Stream.runForEach((state) =>
				Effect.sync(() => {
					if (state.status === "loading") {
						countEl.textContent = "—";
					} else if (state.status === "error") {
						countEl.textContent = "Error";
					} else {
						countEl.textContent = String(state.data.length);
					}
				}),
			),
			Effect.forkScoped,
		);

		yield* Effect.forkScoped(refreshBuckets);

		yield* Effect.never;
	});
}
