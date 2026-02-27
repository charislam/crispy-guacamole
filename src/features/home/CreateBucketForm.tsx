import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateBucketStatus } from "./useCreateBucket";

export function CreateBucketForm({
  inputRef,
  handleSubmit,
  status
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: CreateBucketStatus
}) {
  return (
	<form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-end">
	  <div className="flex flex-col gap-1">
		<Label htmlFor="bucket-name">Bucket name</Label>
		<Input
		  ref={inputRef}
		  id="bucket-name"
		  name="bucket-name"
		  placeholder="my-bucket"
		/>
	  </div>
	  <Button type="submit" disabled={status === "pending"}>
		{status === "pending" ? "Creating..." : "Create"}
	  </Button>
	</form>
  )
}
