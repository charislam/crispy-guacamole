import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Redacted } from "effect";

import { SupabaseCredentialsServiceLive } from "../credentials/service.js";
import {
	SupabaseStorageService,
	SupabaseStorageServiceLive,
} from "./service.js";

const liveLayer = SupabaseStorageServiceLive.pipe(
	Layer.provide(
		SupabaseCredentialsServiceLive({
			url: process.env.SUPABASE_URL!,
			key: Redacted.make(process.env.SUPABASE_KEY!),
		}),
	),
);

describe("SupabaseStorageService (contract)", () => {
	it.effect("listBuckets succeeds and response matches BucketSchema", () =>
		Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			const buckets = yield* storage.listBuckets();
			// Ensure there is at least one bucket so schema validation is exercised
			// on real objects
			expect(buckets.length).toBeGreaterThan(0);
		}).pipe(Effect.provide(liveLayer)),
	);

	it.effect(
		"createBucket creates a private bucket and deleteBucket removes it",
		() =>
			Effect.gen(function* () {
				const storage = yield* SupabaseStorageService;
				const name = `contract-test-private-${Date.now()}`;
				yield* storage.createBucket(name, { public: false });
				const bucketsAfterCreate = yield* storage.listBuckets();
				const bucket = bucketsAfterCreate.find((b) => b.name === name);
				expect(bucket).toBeDefined();
				expect(bucket?.public).toBe(false);
				yield* storage.deleteBucket(name);
				const bucketsAfterDelete = yield* storage.listBuckets();
				expect(bucketsAfterDelete.some((b) => b.name === name)).toBe(false);
			}).pipe(Effect.provide(liveLayer)),
	);

	it.effect(
		"createBucket creates a public bucket and deleteBucket removes it",
		() =>
			Effect.gen(function* () {
				const storage = yield* SupabaseStorageService;
				const name = `contract-test-public-${Date.now()}`;
				yield* storage.createBucket(name, { public: true });
				const bucketsAfterCreate = yield* storage.listBuckets();
				const bucket = bucketsAfterCreate.find((b) => b.name === name);
				expect(bucket).toBeDefined();
				expect(bucket?.public).toBe(true);
				yield* storage.deleteBucket(name);
				const bucketsAfterDelete = yield* storage.listBuckets();
				expect(bucketsAfterDelete.some((b) => b.name === name)).toBe(false);
			}).pipe(Effect.provide(liveLayer)),
	);
});
