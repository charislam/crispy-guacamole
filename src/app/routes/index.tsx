import { createRoute, useNavigate } from "@tanstack/react-router"
import { Effect } from "effect"
import { useContext, useEffect, useEffectEvent, useState } from "react"

import { Button } from "@/components/ui/button.js"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.js"
import { makeAppRuntime } from "@/lib/app/runtime.js"
import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js"
import type { SupabaseCredentials } from "@/lib/credentials/types.js"
import { useCredentials } from "@/lib/hooks/useCredentials.js"
import type { Bucket, StorageRequestError } from "@/lib/storage/service.js"
import { SupabaseStorageService } from "@/lib/storage/service.js"
import { Route as RootRoute } from "./__root.js"

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
})

type BucketsState =
  | { status: "loading" }
  | { status: "ready"; data: Bucket[] }
  | { status: "error"; error: StorageRequestError }

function useBuckets(credentials: SupabaseCredentials) {
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

function HomePage() {
  const store = useContext(CredentialsStoreContext)
  const credentials = useCredentials(store)
  const navigate = useNavigate()

  const redirectToCredentials = useEffectEvent(() => {
	if (credentials.status === "unknown") {
	  navigate({ to: "/credentials" })
	}
  })
  useEffect(() => {
	  redirectToCredentials()
  }, [credentials.status])

  if (credentials.status === "unknown") return null

  return <BucketsList credentials={credentials.credentials} store={store} />
}

function BucketsList({
  credentials,
  store,
}: {
  credentials: SupabaseCredentials
  store: { clearCredentials: () => Effect.Effect<void> }
}) {
  const bucketsState = useBuckets(credentials)
  const navigate = useNavigate()

  const handleClear = () => {
    Effect.runSync(store.clearCredentials())
    navigate({ to: "/credentials" })
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Storage Buckets</h1>
        <Button variant="outline" size="sm" onClick={handleClear}>
          Change credentials
        </Button>
      </div>

      {bucketsState.status === "loading" && (
        <p className="text-muted-foreground">Loading buckets...</p>
      )}

      {bucketsState.status === "error" && (
        <p className="text-destructive">
          Failed to load buckets. Check your credentials and try again.
        </p>
      )}

      {bucketsState.status === "ready" && (
        <>
          {bucketsState.data.length === 0 ? (
            <p className="text-muted-foreground">No buckets found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bucketsState.data.map((bucket) => (
                  <TableRow key={bucket.id}>
                    <TableCell className="font-medium">{bucket.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{bucket.id}</TableCell>
                    <TableCell>{bucket.public ? "Yes" : "No"}</TableCell>
                    <TableCell>{new Date(bucket.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  )
}
