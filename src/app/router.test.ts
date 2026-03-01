import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Scope } from "effect";

import { Navigation } from "@/app/navigation.js";
import {
	makeMemoryHistory,
	mountRouter,
	type Route,
	type RouteContext,
} from "@/app/router.js";

const mockCtx: RouteContext = {
	credentialsStore: {
		getSnapshot: () => ({ status: "unknown", credentials: null }),
		subscribe: () => () => {},
		setCredentials: () => Effect.void,
		clearCredentials: () => Effect.void,
	},
	runtimeFactory: () => {
		throw new Error("runtimeFactory not used in router tests");
	},
};

function makeRoute(path: string): Route {
	return {
		path,
		mount: (container) =>
			Effect.gen(function* () {
				container.innerHTML = path;
				yield* Effect.never;
			}),
	};
}

function makeContainer() {
	const container = document.createElement("div");
	document.body.appendChild(container);
	return container;
}

// Forks the router into the current scope so it is interrupted on scope close.
function startRouter(opts: {
	routes: Route[];
	history: ReturnType<typeof makeMemoryHistory>;
	container: Element;
}) {
	return Effect.forkScoped(
		Effect.scoped(mountRouter({ ctx: mockCtx, ...opts })),
	);
}

// Yields repeatedly until the condition is true (up to maxTicks scheduler turns).
function waitUntil(condition: () => boolean, maxTicks = 50) {
	return Effect.gen(function* () {
		for (let i = 0; i < maxTicks; i++) {
			if (condition()) return;
			yield* Effect.yieldNow();
		}
		throw new Error("waitUntil timed out");
	});
}

describe("mountRouter", () => {
	it.effect("mounts the matching route on initial path", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				yield* startRouter({
					container,
					history,
					routes: [makeRoute("/a"), makeRoute("/b")],
				});

				yield* Effect.yieldNow();
				expect(container.innerHTML).toBe("/a");
			}),
		),
	);

	it.effect("does nothing when no route matches", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/unknown");
				yield* startRouter({ container, history, routes: [makeRoute("/a")] });

				yield* Effect.yieldNow();
				expect(container.innerHTML).toBe("");
			}),
		),
	);

	it.effect("follows redirect before mounting the target route", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				const routes: Route[] = [
					{ path: "/a", redirect: () => "/b", mount: () => Effect.void },
					makeRoute("/b"),
				];
				yield* startRouter({ container, history, routes });

				yield* Effect.yieldNow();
				expect(container.innerHTML).toBe("/b");
			}),
		),
	);

	it.effect("replaces history entry when redirecting", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				const routes: Route[] = [
					{ path: "/a", redirect: () => "/b", mount: () => Effect.void },
					makeRoute("/b"),
				];
				yield* startRouter({ container, history, routes });

				yield* Effect.yieldNow();
				expect(history.pathname).toBe("/b");
			}),
		),
	);

	it.effect("nav.navigate mounts the new route", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				const routes: Route[] = [
					{
						path: "/a",
						mount: (container) =>
							Effect.gen(function* () {
								container.innerHTML = "/a";
								const nav = yield* Navigation;
								yield* nav.navigate("/b");
								yield* Effect.never;
							}),
					},
					makeRoute("/b"),
				];
				yield* startRouter({ container, history, routes });

				yield* waitUntil(() => container.innerHTML === "/b");
				expect(container.innerHTML).toBe("/b");
			}),
		),
	);

	it.effect("nav.navigate pushes to history", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				const routes: Route[] = [
					{
						path: "/a",
						mount: (container) =>
							Effect.gen(function* () {
								container.innerHTML = "/a";
								const nav = yield* Navigation;
								yield* nav.navigate("/b");
								yield* Effect.never;
							}),
					},
					makeRoute("/b"),
				];
				yield* startRouter({ container, history, routes });

				yield* waitUntil(() => history.pathname === "/b");
				expect(history.pathname).toBe("/b");
			}),
		),
	);

	it.effect("popstate event re-renders with the new history path", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				yield* startRouter({
					container,
					history,
					routes: [makeRoute("/a"), makeRoute("/b")],
				});

				yield* Effect.yieldNow();
				expect(container.innerHTML).toBe("/a");

				history.pushState(null, "", "/b");
				window.dispatchEvent(new PopStateEvent("popstate"));

				yield* waitUntil(() => container.innerHTML === "/b");
				expect(container.innerHTML).toBe("/b");
			}),
		),
	);

	it.effect("interrupting the router scope cleans up the active page", () =>
		Effect.gen(function* () {
			const container = makeContainer();
			const history = makeMemoryHistory("/a");
			let cleaned = false;
			const routes: Route[] = [
				{
					path: "/a",
					mount: () =>
						Effect.gen(function* () {
							yield* Effect.addFinalizer(() =>
								Effect.sync(() => {
									cleaned = true;
								}),
							);
							yield* Effect.never;
						}),
				},
			];

			const scope = yield* Scope.make();
			yield* Effect.provideService(
				startRouter({ container, history, routes }),
				Scope.Scope,
				scope,
			);

			yield* Effect.yieldNow();
			expect(cleaned).toBe(false);

			yield* Scope.close(scope, Exit.succeed(undefined));
			expect(cleaned).toBe(true);
		}),
	);

	it.effect("navigating away interrupts the previous page's fiber", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");
				let cleaned = false;
				const routes: Route[] = [
					{
						path: "/a",
						mount: (container) =>
							Effect.gen(function* () {
								container.innerHTML = "/a";
								yield* Effect.addFinalizer(() =>
									Effect.sync(() => {
										cleaned = true;
									}),
								);
								const nav = yield* Navigation;
								yield* nav.navigate("/b");
								yield* Effect.never;
							}),
					},
					makeRoute("/b"),
				];
				yield* startRouter({ container, history, routes });

				yield* waitUntil(() => cleaned);
				yield* waitUntil(() => container.innerHTML === "/b");
				expect(container.innerHTML).toBe("/b");
			}),
		),
	);
});
