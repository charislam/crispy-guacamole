import type { AppRuntimeFactory } from "@/lib/app/runtime-context.js";
import type { CredentialsState } from "@/lib/credentials/types.js";
import type { Effect } from "effect";

export type CredentialsStore = {
	getSnapshot: () => CredentialsState;
	subscribe: (cb: () => void) => () => void;
	setCredentials: (url: string, key: string) => Effect.Effect<void>;
	clearCredentials: () => Effect.Effect<void>;
};

export type RouteContext = {
	credentialsStore: CredentialsStore;
	runtimeFactory: AppRuntimeFactory;
};

export type Route = {
	path: string;
	beforeLoad?: (ctx: RouteContext) => string | null;
	mount: (container: Element, ctx: RouteContext) => () => void;
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

let _navigate: (path: string) => void = () => {};

export const navigate = (path: string) => _navigate(path);

export function mountRouter({
	container,
	routes,
	ctx,
	history,
}: {
	container: Element;
	routes: Route[];
	ctx: RouteContext;
	history: HistoryLike;
}): () => void {
	let currentCleanup: (() => void) | null = null;

	function renderPath(path: string) {
		const route = routes.find((r) => r.path === path);
		if (!route) return;

		const redirect = route.beforeLoad?.(ctx) ?? null;
		if (redirect !== null) {
			history.replaceState(null, "", redirect);
			renderPath(redirect);
			return;
		}

		currentCleanup?.();
		currentCleanup = null;
		container.innerHTML = "";
		currentCleanup = route.mount(container, ctx);
	}

	_navigate = (path: string) => {
		history.pushState(null, "", path);
		renderPath(path);
	};

	const onPopState = () => renderPath(history.pathname);
	window.addEventListener("popstate", onPopState);

	renderPath(history.pathname);

	return () => {
		window.removeEventListener("popstate", onPopState);
		currentCleanup?.();
		currentCleanup = null;
		_navigate = () => {};
	};
}
