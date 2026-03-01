import { effect } from "@preact/signals-core";
import type { Signal } from "@preact/signals-core";

import { el } from "@/lib/dom.js";
import type { CreateBucketStatus } from "./homeState.js";

export function mountCreateBucketForm(
	container: Element,
	onSubmit: (name: string) => void,
	status: Signal<CreateBucketStatus>,
): () => void {
	const form = el("form", { class: "mb-6 flex gap-2 items-end" });

	const fieldDiv = el("div", { class: "flex flex-col gap-1" });

	const label = el("label", { for: "bucket-name", class: "text-sm font-medium" });
	label.textContent = "Bucket name";

	const input = document.createElement("input");
	input.id = "bucket-name";
	input.name = "bucket-name";
	input.placeholder = "my-bucket";
	input.className =
		"flex h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none";

	fieldDiv.append(label, input);

	const submitBtn = document.createElement("button");
	submitBtn.type = "submit";
	submitBtn.className =
		"inline-flex h-9 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground";

	form.append(fieldDiv, submitBtn);
	container.appendChild(form);

	const stopEffect = effect(() => {
		const s = status.value;
		submitBtn.disabled = s === "pending";
		submitBtn.textContent = s === "pending" ? "Creating..." : "Create";
	});

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const name = new FormData(form).get("bucket-name") as string;
		onSubmit(name);
	};
	form.addEventListener("submit", handleSubmit);

	return () => {
		stopEffect();
		form.removeEventListener("submit", handleSubmit);
		form.remove();
	};
}
