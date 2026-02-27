import { Button } from "@/components/ui/button.js"
import { StateSwitch } from "@/components/StateSwitch.js"
import { BucketsError } from "./BucketsError.js"
import { BucketsList } from "./BucketsList.js"
import { BucketsLoading } from "./BucketsLoading.js"
import { useHomePage } from "./useHomePage.js"

export function HomePage() {
  const { bucketsState, onClearCredentials } = useHomePage()

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Storage Buckets</h1>
        <Button variant="outline" size="sm" onClick={onClearCredentials}>
          Change credentials
        </Button>
      </div>
      <StateSwitch
        state={bucketsState}
        cases={{
          loading: () => <BucketsLoading />,
          error: ({ error }) => <BucketsError error={error} />,
          ready: ({ data }) => <BucketsList data={data} />,
        }}
      />
    </div>
  )
}
