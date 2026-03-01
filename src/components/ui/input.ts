import { cn } from "@/lib/utils.js";

type InputOptions = {
	id: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	className?: string;
};

export function Input({
	id,
	name,
	type = "text",
	placeholder,
	required,
	className,
}: InputOptions): HTMLInputElement {
	const input = document.createElement("input");
	input.id = id;
	input.name = name;
	input.type = type;
	if (placeholder) input.placeholder = placeholder;
	if (required) input.required = true;
	input.className = cn(
		"flex h-9 w-full rounded-md border px-3 py-1 text-sm",
		className,
	);
	return input;
}
