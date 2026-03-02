import { Button } from "@/components/ui/button.js";
import { Card, CardHeader } from "@/components/ui/card.js";
import { FormField } from "@/components/ui/form-field.js";
import { Input } from "@/components/ui/input.js";
import { el } from "@/lib/dom.js";

export type CredentialsViewElements = {
	wrapper: HTMLDivElement;
	form: HTMLFormElement;
	urlInput: HTMLInputElement;
};

export function buildCredentialsView(): CredentialsViewElements {
	const urlInput = Input({
		id: "url",
		name: "url",
		type: "url",
		placeholder: "https://your-project.supabase.co",
		required: true,
	});
	const keyInput = Input({
		id: "key",
		name: "key",
		type: "password",
		placeholder: "your-anon-or-service-key",
		required: true,
	});
	const submitBtn = Button("Save credentials", {
		type: "submit",
		className: "w-full",
	});

	const form = el(
		"form",
		{ class: "space-y-4" },
		FormField("Project URL", urlInput),
		FormField("API Key", keyInput),
		submitBtn,
	);

	const wrapper = el(
		"div",
		{ class: "flex-1 flex items-center justify-center p-4" },
		Card([
			CardHeader(
				"Connect to Supabase",
				"Enter your Supabase project URL and API key to get started.",
			),
			form,
		]),
	);

	return { wrapper, form, urlInput };
}
