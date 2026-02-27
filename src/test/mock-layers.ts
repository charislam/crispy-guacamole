import { Effect, Layer } from "effect"
import { vi } from "vitest"

import { StorageRequestError, SupabaseStorageService, type Bucket } from "@/lib/storage/service.js"

export const makeStorageLayerWithBuckets = (buckets: Bucket[]) =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.succeed(buckets),
    createBucket: () => Effect.void,
  })

export const makeStorageLayerWithError = (cause: unknown) =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.fail(new StorageRequestError({ cause })),
    createBucket: () => Effect.void,
  })

export const makeStorageLayerNeverResolves = () =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.never,
    createBucket: () => Effect.never,
  })

export const makeStatefulStorageLayer = (initialBuckets: Bucket[]) => {
  const state = { buckets: [...initialBuckets] }

  const createBucketImpl = (name: string): Effect.Effect<void, StorageRequestError> => {
    state.buckets = [
      ...state.buckets,
      {
        id: name,
        name,
        public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner: "",
      },
    ]
    return Effect.void
  }

  const createBucketSpy = vi.fn(createBucketImpl)

  const layer = Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.succeed(state.buckets),
    createBucket: (name) => createBucketSpy(name),
  })

  return { layer, createBucketSpy }
}
