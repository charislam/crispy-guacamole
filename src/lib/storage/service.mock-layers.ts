import { Data, Effect, Layer } from "effect";
import { vi } from "vitest";

import {
	StorageRequestError,
	SupabaseStorageService,
	type Bucket,
	type StorageItem,
} from "@/lib/storage/service.js";

export const defaultTestStorageLayer = Layer.succeed(SupabaseStorageService, {
	listBuckets: () => Effect.succeed([]),
	createBucket: () => Effect.void,
	deleteBucket: () => Effect.void,
	listFiles: () => Effect.succeed([]),
});

export const makeStorageLayerWithBuckets = (buckets: Bucket[]) =>
	Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.succeed(buckets),
		createBucket: () => Effect.void,
		deleteBucket: () => Effect.void,
		listFiles: () => Effect.succeed([]),
	});

export const makeStorageLayerWithError = (cause: unknown) =>
	Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.fail(new StorageRequestError({ cause })),
		createBucket: () => Effect.void,
		deleteBucket: () => Effect.void,
		listFiles: () => Effect.succeed([]),
	});

export const makeStorageLayerNeverResolves = () =>
	Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.never,
		createBucket: () => Effect.never,
		deleteBucket: () => Effect.never,
		listFiles: () => Effect.never,
	});

export const makeStatefulStorageLayer = (initialBuckets: Bucket[]) => {
	const state = { buckets: [...initialBuckets] };

	const createBucketImpl = (
		name: string,
		options: { public: boolean },
	): Effect.Effect<void, StorageRequestError> => {
		state.buckets = [
			...state.buckets,
			Data.struct({
				id: name,
				name,
				public: options.public,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				owner: "",
			}),
		];
		return Effect.void;
	};

	const createBucketSpy = vi.fn(createBucketImpl);

	const deleteBucketImpl = (
		id: string,
	): Effect.Effect<void, StorageRequestError> => {
		state.buckets = state.buckets.filter((b) => b.id !== id);
		return Effect.void;
	};

	const deleteBucketSpy = vi.fn(deleteBucketImpl);

	const layer = Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.succeed(state.buckets),
		createBucket: (name, options) => createBucketSpy(name, options),
		deleteBucket: (id) => deleteBucketSpy(id),
		listFiles: () => Effect.succeed([]),
	});

	return { layer, createBucketSpy, deleteBucketSpy };
};

export const makeStorageLayerWithFiles = (files: StorageItem[]) =>
	Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.succeed([]),
		createBucket: () => Effect.void,
		deleteBucket: () => Effect.void,
		listFiles: () => Effect.succeed(files),
	});

export const makeStorageLayerWithFilesError = (cause: unknown) =>
	Layer.succeed(SupabaseStorageService, {
		listBuckets: () => Effect.succeed([]),
		createBucket: () => Effect.void,
		deleteBucket: () => Effect.void,
		listFiles: () => Effect.fail(new StorageRequestError({ cause })),
	});

