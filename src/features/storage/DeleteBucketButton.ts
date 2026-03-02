import { Button } from "@/components/ui/button.js";
import { el } from "@/lib/dom.js";
import type { Bucket } from "@/lib/storage/service.js";

export function mountDeleteBucketButton(
	container: Element,
	bucket: Bucket,
	onDelete: (id: string) => void,
): () => void {
	const btn = el(
		"button",
		{ class: "h-8 px-3 rounded-md border text-sm" },
		"Delete",
	);
	container.appendChild(btn);

	let activeDialog: HTMLDialogElement | null = null;

	const handleClick = () => {
		activeDialog = showConfirmDialog(bucket, onDelete);
		activeDialog.addEventListener("close", () => {
			activeDialog = null;
		});
	};
	let controller = new AbortController();
	btn.addEventListener("click", handleClick, { signal: controller.signal });

	return () => {
		controller.abort();
		activeDialog?.close();
		btn.remove();
	};
}

function showConfirmDialog(
	bucket: Bucket,
	onDelete: (id: string) => void,
): HTMLDialogElement {
	const dialog = document.createElement("dialog");
	dialog.className = "rounded-lg p-6 shadow-xl max-w-md w-full m-auto";

	const desc = document.createElement("p");
	desc.className = "text-sm text-muted-foreground mb-4";
	desc.append(
		document.createTextNode('This will permanently delete "'),
		document.createTextNode(bucket.name),
		document.createTextNode(
			'" and all its files. This action cannot be undone.',
		),
	);

	const cancelBtn = Button("Cancel", { variant: "outline" });
	const deleteBtn = Button("Delete", { variant: "destructive" });

	cancelBtn.addEventListener("click", () => {
		dialog.close();
		dialog.remove();
	});

	deleteBtn.addEventListener("click", () => {
		onDelete(bucket.id);
		dialog.close();
		dialog.remove();
	});

	dialog.append(
		el("h2", { class: "text-lg font-semibold mb-2" }, "Delete bucket?"),
		desc,
		el("div", { class: "flex justify-end gap-2 mt-4" }, cancelBtn, deleteBtn),
	);
	document.body.appendChild(dialog);
	dialog.showModal();

	dialog.addEventListener("close", () => dialog.remove());

	return dialog;
}
