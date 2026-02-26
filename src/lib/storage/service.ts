import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { Context, Data, Effect, Layer } from "effect"

import { SupabaseCredentialsService } from "../credentials/service.js"

type ListBucketsResult = Awaited<ReturnType<SupabaseClient["storage"]["listBuckets"]>>
export type Bucket = NonNullable<ListBucketsResult["data"]>[number]
type ListBucketsOptions = Pick<
  NonNullable<Parameters<SupabaseClient["storage"]["listBuckets"]>[0]>,
  "limit" | "offset"
>

export class StorageRequestError extends Data.TaggedError("StorageRequestError")<{
  cause: unknown
}> {}

export class SupabaseStorageService extends Context.Tag(
  "SupabaseStorageService"
)<
  SupabaseStorageService,
  {
    listBuckets: (options?: ListBucketsOptions) => Effect.Effect<Bucket[], StorageRequestError>
  }
>() {}

const listBuckets = (client: SupabaseClient, options?: ListBucketsOptions) =>
  Effect.tryPromise({
    try: () => client.storage.listBuckets(options),
    catch: (cause) => new StorageRequestError({ cause })
  }).pipe(
    Effect.flatMap(({ data, error }) =>
      error !== null
        ? Effect.fail(new StorageRequestError({ cause: error }))
        : Effect.succeed(data ?? [])
    )
  )

export const SupabaseStorageServiceLive = Layer.effect(
  SupabaseStorageService,
  Effect.gen(function* () {
    const { url, key } = yield* SupabaseCredentialsService
    const client = createClient(url, key)
    return {
      listBuckets: (options) => listBuckets(client, options)
    }
  })
)
