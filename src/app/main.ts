import { Effect, Scope } from "effect";

import { credentialsRoute } from "@/features/credentials/CredentialsPage.js";
import { homeRoute } from "@/features/home/HomePage.js";
import { makeAppRuntime } from "@/lib/app/runtime.js";
import { makeCredentialsStore } from "@/lib/credentials/store.js";
import {
	browserHistory,
	mountRouter,
	type HistoryLike,
	type RouteContext,
} from "./router.js";

import "@/app/index.css";

export function mountApp(
	container: Element,
	opts: {
		credentialsStore: RouteContext["credentialsStore"];
		runtimeFactory: RouteContext["runtimeFactory"];
		history?: HistoryLike;
	},
): Effect.Effect<void, never, Scope.Scope> {
	const { credentialsStore, runtimeFactory, history = browserHistory } = opts;
	const ctx: RouteContext = { credentialsStore, runtimeFactory };
	const routes = [homeRoute, credentialsRoute];
	return mountRouter({ container, routes, ctx, history });
}

// Browser bootstrap — only runs when the #root element exists (not in tests)
const rootEl = document.getElementById("root");
if (rootEl) {
	Effect.runFork(
		Effect.scoped(
			Effect.gen(function* () {
				const credentialsStore = yield* makeCredentialsStore;
				yield* mountApp(rootEl, {
					credentialsStore,
					runtimeFactory: makeAppRuntime,
				});
			}),
		),
	);
}
