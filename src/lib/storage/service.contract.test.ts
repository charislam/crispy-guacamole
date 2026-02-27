import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

import { SupabaseCredentialsServiceLive } from "../credentials/service.js";
import {
	SupabaseStorageService,
	SupabaseStorageServiceLive,
} from "./service.js";

const liveLayer = SupabaseStorageServiceLive.pipe(
	Layer.provide(
		SupabaseCredentialsServiceLive({
			url: process.env.SUPABASE_URL!,
			key: process.env.SUPABASE_KEY!,
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

	it.effect("createBucket and deleteBucket round-trip correctly", () =>
		Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			const name = `contract-test-${Date.now()}`;
			yield* storage.createBucket(name);
			const bucketsAfterCreate = yield* storage.listBuckets();
			expect(bucketsAfterCreate.some((b) => b.name === name)).toBe(true);
			yield* storage.deleteBucket(name);
			const bucketsAfterDelete = yield* storage.listBuckets();
			expect(bucketsAfterDelete.some((b) => b.name === name)).toBe(false);
		}).pipe(Effect.provide(liveLayer)),
	);
});
