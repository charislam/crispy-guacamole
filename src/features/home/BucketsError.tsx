import type { StorageRequestError } from "@/lib/storage/service.js"

export function BucketsError(_: { error: StorageRequestError }) {
  return (
    <p className="text-destructive">
      Failed to load buckets. Check your credentials and try again.
    </p>
  )
}
