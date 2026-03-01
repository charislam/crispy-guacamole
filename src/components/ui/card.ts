import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";

export function Card(children: (Node | string)[], className?: string): HTMLDivElement {
	return el(
		"div",
		{ class: cn("w-full max-w-md rounded-lg border p-6 shadow-sm", className) },
		...children,
	);
}

export function CardHeader(
	title: string,
	description: string,
	className?: string,
): HTMLDivElement {
	const cardTitle = el("h2", { class: "text-xl font-bold" }, title);
	const cardDesc = el(
		"p",
		{ class: "text-sm text-muted-foreground mt-1" },
		description,
	);
	return el("div", { class: cn("mb-6", className) }, cardTitle, cardDesc);
}
