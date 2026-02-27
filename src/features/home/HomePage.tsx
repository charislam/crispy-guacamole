import { StateSwitch } from "@/components/StateSwitch.js"
import { Button } from "@/components/ui/button.js"
import { useRef } from "react"
import { BucketsError } from "./BucketsError.js"
import { BucketsList } from "./BucketsList.js"
import { BucketsLoading } from "./BucketsLoading.js"
import { CreateBucketForm } from "./CreateBucketForm.js"
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

  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
	const formData = new FormData(e.currentTarget)
	const bucketName = formData.get("bucket-name") as string
    submitCreateBucket(bucketName)
  }

  const handleCancel = () => {
	if (inputRef.current) inputRef.current.value = ""
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
		<CreateBucketForm
		  inputRef={inputRef}
		  handleSubmit={handleSubmit}
		  status={createBucketStatus}
		/>
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
