import { Effect, Fiber, Queue, Scope, SubscriptionRef } from "effect";

import type { AppRuntimeFactory } from "@/lib/app/runtime.js";
import type { CredentialsStore } from "@/lib/credentials/store.js";
import {
	Navigation,
	NavigationEvents,
	type NavigationEventsStream,
	type NavigationService,
} from "./navigation.js";

export type RouteContext = {
	credentialsStore: CredentialsStore;
	runtimeFactory: AppRuntimeFactory;
};

export type Layout = {
	mount: (
		container: Element,
		ctx: RouteContext,
	) => Effect.Effect<
		{
			outlet: Element;
		},
		never,
		Scope.Scope | NavigationService | NavigationEventsStream
	>;
};

export type Route = {
	path: string;
	redirect?: (ctx: RouteContext) => string | null;
	mount: (
		container: Element,
		ctx: RouteContext,
	) => Effect.Effect<void, never, Scope.Scope | NavigationService>;
};

export type HistoryLike = {
	readonly pathname: string;
	pushState(data: unknown, title: string, url: string): void;
	replaceState(data: unknown, title: string, url: string): void;
};

export const browserHistory: HistoryLike = {
	get pathname() {
		return window.location.pathname;
	},
	pushState: (data, title, url) => window.history.pushState(data, title, url),
	replaceState: (data, title, url) =>
		window.history.replaceState(data, title, url),
};

export function makeMemoryHistory(initialPath: string): HistoryLike {
	let path = initialPath;
	return {
		get pathname() {
			return path;
		},
		pushState(_: unknown, __: string, url: string) {
			path = url;
		},
		replaceState(_: unknown, __: string, url: string) {
			path = url;
		},
	};
}

function subscribePopState(
	history: HistoryLike,
	queue: Queue.Queue<string>,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.acquireRelease(
		Effect.sync(() => {
			const controller = new AbortController();
			window.addEventListener(
				"popstate",
				() => Effect.runFork(Queue.offer(queue, history.pathname)),
				{ signal: controller.signal },
			);
			return controller;
		}),
		(controller) => Effect.sync(() => controller.abort()),
	).pipe(Effect.asVoid);
}

export function mountRouter({
	container,
	routes,
	layout,
	ctx,
	history,
}: {
	container: Element;
	routes: Route[];
	layout?: Layout;
	ctx: RouteContext;
	history: HistoryLike;
}): Effect.Effect<void, never, Scope.Scope> {
	return Effect.gen(function* () {
		let currentFiber: Fiber.RuntimeFiber<void, never> | null = null;
		const navQueue = yield* Queue.unbounded<string>();
		const navEventsRef = yield* SubscriptionRef.make(history.pathname);

		const nav: NavigationService = {
			navigate: (p) =>
				Effect.gen(function* () {
					history.pushState(null, "", p);
					yield* Queue.offer(navQueue, p);
				}),
		};

		const outlet = yield* Effect.gen(function* () {
			if (layout) {
				const { outlet } = yield* layout
					.mount(container, ctx)
					.pipe(
						Effect.provideService(Navigation, nav),
						Effect.provideService(NavigationEvents, navEventsRef),
					);
				return outlet;
			} else {
				return container;
			}
		});

		const renderPath = (path: string): Effect.Effect<void> =>
			Effect.gen(function* () {
				const route = routes.find((r) => r.path === path);
				if (!route) return;

				const redirect = route.redirect?.(ctx) ?? null;
				if (redirect !== null) {
					history.replaceState(null, "", redirect);
					yield* renderPath(redirect);
					return;
				}

				if (currentFiber) {
					yield* Fiber.interrupt(currentFiber);
					currentFiber = null;
				}

				yield* SubscriptionRef.set(navEventsRef, path);

				const pageEffect = route
					.mount(outlet, ctx)
					.pipe(Effect.provideService(Navigation, nav), Effect.scoped);

				currentFiber = Effect.runFork(pageEffect);
			});

		yield* Effect.addFinalizer(() =>
			currentFiber ? Fiber.interrupt(currentFiber) : Effect.void,
		);

		yield* subscribePopState(history, navQueue);

		yield* Queue.offer(navQueue, history.pathname);
		yield* Queue.take(navQueue).pipe(
			Effect.flatMap(renderPath),
			Effect.forever,
		);
	});
}
