import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.js";
import type { Bucket } from "@/lib/storage/service.js";
import { DeleteBucketButton } from "./DeleteBucketButton";

export function BucketsList({ data, onDeleteBucket }: { data: Bucket[]; onDeleteBucket: (id: string) => void }) {
  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Public</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((bucket) => (
          <TableRow key={bucket.id}>
            <TableCell className="font-medium">{bucket.name}</TableCell>
            <TableCell className="text-muted-foreground font-mono text-sm">{bucket.id}</TableCell>
            <TableCell>{bucket.public ? "Yes" : "No"}</TableCell>
            <TableCell>{new Date(bucket.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
			  <DeleteBucketButton bucket={bucket} onDelete={onDeleteBucket} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyState() {
  return <p className="text-muted-foreground">No buckets found.</p>
}
