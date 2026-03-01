import { Effect, Fiber, type Layer } from "effect";

import { mountApp } from "@/app/main.js";
import { makeRuntimeFromLayer } from "@/lib/app/runtime.js";
import { makeCredentialsStore } from "@/lib/credentials/store.js";
import type { SupabaseStorageService } from "@/lib/storage/service.js";
import { defaultTestStorageLayer } from "@/lib/storage/service.mock-layers.js";
import { makeMemoryHistory } from "@/app/router.js";

type RenderAppOptions = {
	initialPath?: string;
	storageLayer?: Layer.Layer<SupabaseStorageService>;
	initialCredentials?: { url: string; key: string } | null;
};

let lastFiber: Fiber.RuntimeFiber<void, never> | null = null;

export async function renderApp({
	initialPath = "/",
	storageLayer = defaultTestStorageLayer,
	initialCredentials = null,
}: RenderAppOptions = {}) {
	const credentialsStore = Effect.runSync(makeCredentialsStore);
	if (initialCredentials) {
		Effect.runSync(
			credentialsStore.setCredentials(
				initialCredentials.url,
				initialCredentials.key,
			),
		);
	}

	const runtimeFactory = (_credentials: unknown) =>
		makeRuntimeFromLayer(storageLayer);

	const container = document.createElement("div");
	document.body.appendChild(container);

	const history = makeMemoryHistory(initialPath);

	lastFiber = Effect.runFork(
		Effect.scoped(
			mountApp(container, { credentialsStore, runtimeFactory, history }),
		),
	);

	return { container };
}

export async function cleanupLastApp(): Promise<void> {
	if (lastFiber) {
		await Effect.runPromise(Fiber.interrupt(lastFiber));
		lastFiber = null;
	}
}
