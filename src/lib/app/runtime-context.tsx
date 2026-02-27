import { createContext, useContext } from "react";
import type { ManagedRuntime } from "effect";

import { makeAppRuntime } from "./runtime.js";
import type { SupabaseCredentials } from "../credentials/types.js";
import type { SupabaseStorageService } from "../storage/service.js";

export type AppRuntimeFactory = (
	credentials: SupabaseCredentials,
) => ManagedRuntime.ManagedRuntime<SupabaseStorageService, never>;

export const RuntimeContext = createContext<AppRuntimeFactory>(makeAppRuntime);

export const useRuntimeFactory = () => useContext(RuntimeContext);
