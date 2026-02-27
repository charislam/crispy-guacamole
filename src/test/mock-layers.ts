import { Effect, Layer } from "effect"

import { StorageRequestError, SupabaseStorageService, type Bucket } from "@/lib/storage/service.js"

export const makeStorageLayerWithBuckets = (buckets: Bucket[]) =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.succeed(buckets),
  })

export const makeStorageLayerWithError = (cause: unknown) =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.fail(new StorageRequestError({ cause })),
  })

export const makeStorageLayerNeverResolves = () =>
  Layer.succeed(SupabaseStorageService, {
    listBuckets: () => Effect.never,
  })
