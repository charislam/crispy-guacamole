import { Effect } from "effect"
import { useCallback, useState } from "react"

import { useRuntimeFactory } from "@/lib/app/runtime-context.js"
import type { SupabaseCredentials } from "@/lib/credentials/types.js"
import { SupabaseStorageService } from "@/lib/storage/service.js"

export type CreateBucketStatus = "idle" | "pending" | "success" | "error"

export function useCreateBucket(credentials: SupabaseCredentials, onSuccess: () => void) {
  const [status, setStatus] = useState<CreateBucketStatus>("idle")
  const runtimeFactory = useRuntimeFactory()

  const submit = useCallback((name: string) => {
    setStatus("pending")
    const runtime = runtimeFactory(credentials)
    const program = Effect.gen(function* () {
      const storage = yield* SupabaseStorageService
      yield* storage.createBucket(name)
    }).pipe(Effect.match({ onSuccess: () => "success" as const, onFailure: () => "error" as const }))

    runtime.runPromise(program).then((nextStatus) => {
      setStatus(nextStatus)
      void runtime.dispose()
      if (nextStatus === "success") onSuccess()
    })
  }, [credentials, runtimeFactory, onSuccess])

  return { submit, status }
}
