import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";

type ButtonOptions = {
	variant?: "primary" | "outline" | "destructive";
	type?: "submit" | "button";
	className?: string;
};

export function Button(
	text: string,
	options: ButtonOptions = {},
): HTMLButtonElement {
	const { variant = "primary", type = "button", className } = options;

	const baseClass = "inline-flex h-9 items-center rounded-md text-sm";
	const solidClasses = "justify-center px-4 py-2 font-medium";

	const variantClass =
		variant === "primary"
			? cn(solidClasses, "bg-primary text-primary-foreground")
			: variant === "destructive"
				? cn(solidClasses, "bg-destructive text-destructive-foreground")
				: "border px-3";

	return el(
		"button",
		{
			type,
			class: cn(baseClass, variantClass, className),
		},
		text,
	);
}
