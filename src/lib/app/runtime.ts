import { Layer, ManagedRuntime } from "effect";

import { SupabaseCredentialsServiceLive } from "../credentials/service.js";
import type { SupabaseCredentials } from "../credentials/types.js";
import {
	SupabaseStorageService,
	SupabaseStorageServiceLive,
} from "../storage/service.js";

export type AppRuntimeFactory = (
	credentials: SupabaseCredentials,
) => ManagedRuntime.ManagedRuntime<SupabaseStorageService, never>;

const makeAppLayer = (credentials: SupabaseCredentials) =>
	SupabaseStorageServiceLive.pipe(
		Layer.provide(SupabaseCredentialsServiceLive(credentials)),
	);

export const makeAppRuntime = (credentials: SupabaseCredentials) =>
	ManagedRuntime.make(makeAppLayer(credentials));

export const makeRuntimeFromLayer = (
	layer: Layer.Layer<SupabaseStorageService>,
) => ManagedRuntime.make(layer);
