import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { Effect, type Layer } from "effect";

import { createAppRouter } from "@/app/router.js";
import {
	RuntimeContext,
	type AppRuntimeFactory,
} from "@/lib/app/runtime-context.js";
import { makeRuntimeFromLayer } from "@/lib/app/runtime.js";
import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js";
import { makeCredentialsStore } from "@/lib/credentials/store.js";
import type { SupabaseStorageService } from "@/lib/storage/service.js";
import { defaultTestStorageLayer } from "@/lib/storage/service.mock-layers.js";

type RenderAppOptions = {
	initialPath?: string;
	storageLayer?: Layer.Layer<SupabaseStorageService>;
	initialCredentials?: { url: string; key: string } | null;
};

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

	const runtimeFactory: AppRuntimeFactory = (_credentials) =>
		makeRuntimeFromLayer(storageLayer);

	const history = createMemoryHistory({ initialEntries: [initialPath] });
	const router = createAppRouter({ context: { credentialsStore }, history });
	await router.load();

	return render(
		<CredentialsStoreContext.Provider value={credentialsStore}>
			<RuntimeContext.Provider value={runtimeFactory}>
				<RouterProvider router={router} />
			</RuntimeContext.Provider>
		</CredentialsStoreContext.Provider>,
	);
}
