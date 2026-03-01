import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/ui/form-field.js";
import { Input } from "@/components/ui/input.js";
import { el } from "@/lib/dom.js";

export type CreateBucketFormViewElements = {
	form: HTMLFormElement;
	input: HTMLInputElement;
	submitBtn: HTMLButtonElement;
};

export function buildCreateBucketFormView(): CreateBucketFormViewElements {
	const input = Input({
		id: "bucket-name",
		name: "bucket-name",
		placeholder: "my-bucket",
		className: "w-full",
	});
	const submitBtn = Button("Create", { type: "submit" });

	const form = el(
		"form",
		{ class: "mb-6 flex gap-2 items-end" },
		FormField("Bucket name", input),
		submitBtn,
	);

	return { form, input, submitBtn };
}
