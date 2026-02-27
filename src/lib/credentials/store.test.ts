import { beforeEach, describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { makeCredentialsStore } from "./store";

const STORAGE_KEY = "credentials";

describe("makeCredentialsStore", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it.effect("initializes with unknown state", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			expect(store.getSnapshot()).toEqual({
				status: "unknown",
				credentials: null,
			});
		}),
	);

	it.effect("setCredentials transitions to known state", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://example.supabase.co", "secret-key");
			expect(store.getSnapshot()).toEqual({
				status: "known",
				credentials: { url: "https://example.supabase.co", key: "secret-key" },
			});
		}),
	);

	it.effect("setCredentials stores the provided url and key", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://a.supabase.co", "key-a");
			const snapshot = store.getSnapshot();
			expect(snapshot.status).toBe("known");
			if (snapshot.status === "known") {
				expect(snapshot.credentials.url).toBe("https://a.supabase.co");
				expect(snapshot.credentials.key).toBe("key-a");
			}
		}),
	);

	it.effect("clearCredentials transitions back to unknown state", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://example.supabase.co", "secret-key");
			yield* store.clearCredentials();
			expect(store.getSnapshot()).toEqual({
				status: "unknown",
				credentials: null,
			});
		}),
	);

	it.effect("setCredentials overwrites previously set credentials", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://first.supabase.co", "key-1");
			yield* store.setCredentials("https://second.supabase.co", "key-2");
			expect(store.getSnapshot()).toEqual({
				status: "known",
				credentials: { url: "https://second.supabase.co", key: "key-2" },
			});
		}),
	);

	it.effect("notifies subscribers when credentials are set", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			let notified = false;
			store.subscribe(() => {
				notified = true;
			});

			yield* store.setCredentials("https://example.supabase.co", "key");
			yield* Effect.yieldNow();

			expect(notified).toBe(true);
		}),
	);

	it.effect("notifies subscribers when credentials are cleared", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://example.supabase.co", "key");

			let notified = false;
			store.subscribe(() => {
				notified = true;
			});

			yield* store.clearCredentials();
			yield* Effect.yieldNow();

			expect(notified).toBe(true);
		}),
	);

	it.effect("initializes from localStorage when credentials are stored", () =>
		Effect.gen(function* () {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					url: "https://stored.supabase.co",
					key: "stored-key",
				}),
			);
			const store = yield* makeCredentialsStore;
			expect(store.getSnapshot()).toEqual({
				status: "known",
				credentials: { url: "https://stored.supabase.co", key: "stored-key" },
			});
		}),
	);

	it.effect("setCredentials persists to localStorage", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://example.supabase.co", "secret-key");
			const stored = localStorage.getItem(STORAGE_KEY);
			expect(stored).toBe(
				JSON.stringify({
					url: "https://example.supabase.co",
					key: "secret-key",
				}),
			);
		}),
	);

	it.effect("clearCredentials removes from localStorage", () =>
		Effect.gen(function* () {
			const store = yield* makeCredentialsStore;
			yield* store.setCredentials("https://example.supabase.co", "secret-key");
			yield* store.clearCredentials();
			expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
		}),
	);

	it.effect(
		"initializes with unknown state when localStorage contains invalid JSON",
		() =>
			Effect.gen(function* () {
				localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
				const store = yield* makeCredentialsStore;
				expect(store.getSnapshot()).toEqual({
					status: "unknown",
					credentials: null,
				});
			}),
	);
});
