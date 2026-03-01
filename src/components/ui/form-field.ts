import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";

export function FormField(
	labelText: string,
	inputEl: HTMLInputElement,
	className?: string,
): HTMLDivElement {
	const label = el(
		"label",
		{ for: inputEl.id, class: "text-sm font-medium" },
		labelText,
	);
	return el("div", { class: cn("space-y-2", className) }, label, inputEl);
}
