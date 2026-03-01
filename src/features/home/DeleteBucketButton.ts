import { el } from "@/lib/dom.js";
import type { Bucket } from "@/lib/storage/service.js";

export function mountDeleteBucketButton(
	container: Element,
	bucket: Bucket,
	onDelete: (id: string) => void,
): () => void {
	const btn = el("button", {
		class: "h-8 px-3 rounded-md border text-sm",
	});
	btn.textContent = "Delete bucket";
	container.appendChild(btn);

	const handleClick = () => showConfirmDialog(bucket, onDelete);
	btn.addEventListener("click", handleClick);

	return () => {
		btn.removeEventListener("click", handleClick);
		btn.remove();
	};
}

function showConfirmDialog(bucket: Bucket, onDelete: (id: string) => void) {
	const dialog = document.createElement("dialog");
	dialog.className = "rounded-lg p-6 shadow-xl max-w-md w-full m-auto";

	const title = el("h2", { class: "text-lg font-semibold mb-2" }, "Delete bucket?");

	const desc = document.createElement("p");
	desc.className = "text-sm text-muted-foreground mb-4";
	// Safe: bucket.name set via text nodes, never innerHTML
	desc.append(
		document.createTextNode('This will permanently delete "'),
		document.createTextNode(bucket.name),
		document.createTextNode(
			'" and all its files. This action cannot be undone.',
		),
	);

	const footer = el("div", { class: "flex justify-end gap-2 mt-4" });

	const cancelBtn = el("button", {
		class: "h-9 px-4 rounded-md border text-sm",
	}, "Cancel");

	const deleteBtn = el("button", {
		class: "h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm",
	}, "Delete");

	cancelBtn.addEventListener("click", () => {
		dialog.close();
		dialog.remove();
	});

	deleteBtn.addEventListener("click", () => {
		onDelete(bucket.id);
		dialog.close();
		dialog.remove();
	});

	footer.append(cancelBtn, deleteBtn);
	dialog.append(title, desc, footer);
	document.body.appendChild(dialog);
	dialog.showModal();

	dialog.addEventListener("close", () => dialog.remove());
}
