import { Effect } from "effect";

import { makeCredentialsStore } from "@/lib/credentials/store.js";
import { makeAppRuntime } from "@/lib/app/runtime-context.js";
import { credentialsRoute } from "@/features/credentials/CredentialsPage.js";
import { homeRoute } from "@/features/home/HomePage.js";
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
): () => void {
	const { credentialsStore, runtimeFactory, history = browserHistory } = opts;
	const ctx: RouteContext = { credentialsStore, runtimeFactory };
	const routes = [homeRoute, credentialsRoute];
	return mountRouter({ container, routes, ctx, history });
}

// Browser bootstrap — only runs when the #root element exists (not in tests)
const rootEl = document.getElementById("root");
if (rootEl) {
	const credentialsStore = Effect.runSync(makeCredentialsStore);
	mountApp(rootEl, {
		credentialsStore,
		runtimeFactory: makeAppRuntime,
	});
}
