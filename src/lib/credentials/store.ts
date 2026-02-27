import { Effect, Schema } from "effect";

import { makeStore } from "../resource/store.js";
import type { CredentialsState } from "./types.js";

const STORAGE_KEY = "credentials";

const StoredCredentials = Schema.parseJson(
	Schema.Struct({ url: Schema.String, key: Schema.String }),
);

const readInitialState = Effect.gen(function* () {
	const raw = yield* Effect.sync(() => localStorage.getItem(STORAGE_KEY));
	if (!raw) return { status: "unknown" as const, credentials: null };

	const parsed = yield* Schema.decodeUnknown(StoredCredentials)(raw).pipe(
		Effect.orElseSucceed(() => null),
	);

	if (parsed === null) return { status: "unknown" as const, credentials: null };
	return { status: "known" as const, credentials: parsed };
});

export const makeCredentialsStore = Effect.gen(function* () {
	const initial: CredentialsState = yield* readInitialState;

	const store = yield* makeStore<CredentialsState>(initial);

	const setCredentials = (url: string, key: string) =>
		Effect.gen(function* () {
			yield* store.update(() => ({
				status: "known",
				credentials: { url, key },
			}));
			yield* Effect.sync(() =>
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key })),
			);
		});

	const clearCredentials = () =>
		Effect.gen(function* () {
			yield* store.update(() => ({ status: "unknown", credentials: null }));
			yield* Effect.sync(() => localStorage.removeItem(STORAGE_KEY));
		});

	return { ...store, setCredentials, clearCredentials };
});
