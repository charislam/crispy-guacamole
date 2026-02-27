import { useState } from "react"
import { Button } from "@/components/ui/button.js"
import { Input } from "@/components/ui/input.js"
import { Label } from "@/components/ui/label.js"
import { StateSwitch } from "@/components/StateSwitch.js"
import { BucketsError } from "./BucketsError.js"
import { BucketsList } from "./BucketsList.js"
import { BucketsLoading } from "./BucketsLoading.js"
import { useHomePage } from "./useHomePage.js"

export function HomePage() {
  const {
    bucketsState,
    onClearCredentials,
    showCreateForm,
    onToggleCreateForm,
    submitCreateBucket,
    createBucketStatus,
    submitDeleteBucket,
  } = useHomePage()
  const [bucketName, setBucketName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitCreateBucket(bucketName)
  }

  const handleCancel = () => {
    setBucketName("")
    onToggleCreateForm()
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Storage Buckets</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClearCredentials}>
            Change credentials
          </Button>
          {showCreateForm ? (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          ) : (
            <Button size="sm" onClick={onToggleCreateForm}>
              Add bucket
            </Button>
          )}
        </div>
      </div>
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="bucket-name">Bucket name</Label>
            <Input
              id="bucket-name"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              placeholder="my-bucket"
            />
          </div>
          <Button type="submit" disabled={createBucketStatus === "pending"}>
            {createBucketStatus === "pending" ? "Creating..." : "Create"}
          </Button>
        </form>
      )}
      <StateSwitch
        state={bucketsState}
        cases={{
          loading: () => <BucketsLoading />,
          error: ({ error }) => <BucketsError error={error} />,
          ready: ({ data }) => <BucketsList data={data} onDeleteBucket={submitDeleteBucket} />,
        }}
      />
    </div>
  )
}
