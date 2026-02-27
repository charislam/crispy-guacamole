import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.js"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.js"
import { Button } from "@/components/ui/button.js"
import type { Bucket } from "@/lib/storage/service.js"

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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete bucket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{bucket.name}&quot; and all its files. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteBucket(bucket.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
