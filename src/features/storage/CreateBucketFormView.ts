import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/ui/form-field.js";
import { Input } from "@/components/ui/input.js";
import { el } from "@/lib/dom.js";

export type CreateBucketFormViewElements = {
	form: HTMLFormElement;
	input: HTMLInputElement;
	publicCheckbox: HTMLInputElement;
	submitBtn: HTMLButtonElement;
	cancelBtn: HTMLButtonElement;
};

export function buildCreateBucketFormView(): CreateBucketFormViewElements {
	const input = Input({
		id: "bucket-name",
		name: "bucket-name",
		placeholder: "my-bucket",
		className: "w-full",
	});

	const publicCheckbox = el("input", {
		type: "checkbox",
		id: "bucket-public",
		name: "bucket-public",
		class: "h-4 w-4 rounded border",
	});

	const cancelBtn = Button("Cancel", { variant: "outline" });
	const submitBtn = Button("Create", { type: "submit" });

	const form = el(
		"form",
		{ class: "space-y-4" },
		FormField("Bucket name", input),
		el(
			"div",
			{ class: "flex items-center gap-2" },
			publicCheckbox,
			el(
				"label",
				{ for: "bucket-public", class: "text-sm font-medium cursor-pointer" },
				"Public bucket",
			),
		),
		el("div", { class: "flex justify-end gap-2 mt-4" }, cancelBtn, submitBtn),
	);

	return { form, input, publicCheckbox, submitBtn, cancelBtn };
}
