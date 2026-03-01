import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Scope } from "effect";

import { Navigation } from "@/app/navigation.js";
import {
	makeMemoryHistory,
	mountRouter,
	type Layout,
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
	layout?: Layout;
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

	it.effect("layout wraps route content and persists across navigation", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");

				let layoutMounts = 0;

				const layout = {
					mount: (container: Element) =>
						Effect.gen(function* () {
							layoutMounts++;

							const wrapper = document.createElement("div");
							wrapper.setAttribute("data-layout", "true");

							const nav = document.createElement("nav");
							nav.textContent = "NAV";

							const outlet = document.createElement("main");

							wrapper.appendChild(nav);
							wrapper.appendChild(outlet);
							container.appendChild(wrapper);

							return { outlet };
						}),
				};

				yield* startRouter({
					container,
					history,
					routes: [makeRoute("/a"), makeRoute("/b")],
					layout,
				});

				yield* waitUntil(() => container.innerHTML.includes("/a"));

				expect(container.querySelector("nav")?.textContent).toBe("NAV");
				expect(container.innerHTML.includes("/a")).toBe(true);
				expect(layoutMounts).toBe(1);

				history.pushState(null, "", "/b");
				window.dispatchEvent(new PopStateEvent("popstate"));

				yield* waitUntil(() => container.innerHTML.includes("/b"));

				// layout still present
				expect(container.querySelector("nav")?.textContent).toBe("NAV");
				expect(layoutMounts).toBe(1);
			}),
		),
	);

	it.effect("navigating clears only outlet, not layout", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");

				const layout = {
					mount: (container: Element) =>
						Effect.gen(function* () {
							const wrapper = document.createElement("div");

							const nav = document.createElement("nav");
							nav.textContent = "NAV";

							const outlet = document.createElement("main");

							wrapper.appendChild(nav);
							wrapper.appendChild(outlet);
							container.appendChild(wrapper);

							return { outlet };
						}),
				};

				yield* startRouter({
					container,
					history,
					routes: [makeRoute("/a"), makeRoute("/b")],
					layout,
				});

				yield* waitUntil(() => container.innerHTML.includes("/a"));

				const navNode = container.querySelector("nav");

				history.pushState(null, "", "/b");
				window.dispatchEvent(new PopStateEvent("popstate"));

				yield* waitUntil(() => container.innerHTML.includes("/b"));

				// same nav node instance
				expect(container.querySelector("nav")).toBe(navNode);
			}),
		),
	);

	it.effect("layout can use Navigation service", () =>
		Effect.scoped(
			Effect.gen(function* () {
				const container = makeContainer();
				const history = makeMemoryHistory("/a");

				const layout = {
					mount: (container: Element) =>
						Effect.gen(function* () {
							const navService = yield* Navigation;

							const wrapper = document.createElement("div");
							const button = document.createElement("button");
							button.textContent = "Go B";

							button.onclick = () => {
								Effect.runFork(navService.navigate("/b"));
							};

							const outlet = document.createElement("main");

							wrapper.appendChild(button);
							wrapper.appendChild(outlet);
							container.appendChild(wrapper);

							return { outlet };
						}),
				};

				yield* startRouter({
					container,
					history,
					routes: [makeRoute("/a"), makeRoute("/b")],
					layout,
				});

				yield* waitUntil(() => container.innerHTML.includes("/a"));

				(container.querySelector("button") as HTMLButtonElement).click();

				yield* waitUntil(() => container.innerHTML.includes("/b"));
				expect(history.pathname).toBe("/b");
			}),
		),
	);

	it.effect("closing router scope cleans up layout", () =>
		Effect.gen(function* () {
			const container = makeContainer();
			const history = makeMemoryHistory("/a");

			let cleaned = false;

			const layout = {
				mount: (container: Element) =>
					Effect.gen(function* () {
						yield* Effect.addFinalizer(() =>
							Effect.sync(() => {
								cleaned = true;
							}),
						);

						const outlet = document.createElement("main");
						container.appendChild(outlet);

						return { outlet };
					}),
			};

			const scope = yield* Scope.make();

			yield* Effect.provideService(
				Effect.forkScoped(
					Effect.scoped(
						mountRouter({
							container,
							history,
							routes: [makeRoute("/a")],
							ctx: mockCtx,
							layout,
						}),
					),
				),
				Scope.Scope,
				scope,
			);

			yield* Effect.yieldNow();
			expect(cleaned).toBe(false);

			yield* Scope.close(scope, Exit.succeed(undefined));
			expect(cleaned).toBe(true);
		}),
	);
});
