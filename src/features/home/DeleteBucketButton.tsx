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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Bucket } from "@/lib/storage/service";
import { Trash } from "lucide-react";

export function DeleteBucketButton({
	bucket,
	onDelete,
}: {
	bucket: Bucket;
	onDelete: (bucketId: string) => void;
}) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline" size="sm">
					<span className="sr-only">Delete bucket</span>
					<Trash className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete bucket?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete &quot;{bucket.name}&quot; and all its
						files. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => onDelete(bucket.id)}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
