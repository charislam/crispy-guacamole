import { Effect } from "effect"
import { useEffect, useState } from "react"

import { makeAppRuntime } from "@/lib/app/runtime.js"
import type { SupabaseCredentials } from "@/lib/credentials/types.js"
import type { Bucket, StorageRequestError } from "@/lib/storage/service.js"
import { SupabaseStorageService } from "@/lib/storage/service.js"

export type BucketsState =
  | { status: "loading" }
  | { status: "ready"; data: Bucket[] }
  | { status: "error"; error: StorageRequestError }

export function useBuckets(credentials: SupabaseCredentials) {
  const [state, setState] = useState<BucketsState>({ status: "loading" })

  useEffect(() => {
    setState({ status: "loading" })
    const runtime = makeAppRuntime(credentials)
    let cancelled = false

    const program = Effect.gen(function* () {
      const storage = yield* SupabaseStorageService
      return yield* storage.listBuckets()
    }).pipe(
      Effect.match({
        onSuccess: (data): BucketsState => ({ status: "ready", data }),
        onFailure: (error): BucketsState => ({ status: "error", error }),
      })
    )

    runtime
      .runPromise(program)
      .then((state) => { if (!cancelled) setState(state) })

    return () => {
      cancelled = true
      void runtime.dispose()
    }
  }, [credentials])

  return state
}
