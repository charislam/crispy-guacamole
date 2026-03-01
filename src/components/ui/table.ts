import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";

export function Table(): HTMLTableElement {
	return el("table", { class: "w-full text-sm" });
}

export function TableHead(columns: string[]): HTMLTableSectionElement {
	const thead = el("thead");
	const row = el("tr");
	for (const col of columns) {
		row.appendChild(TableHeaderCell(col));
	}
	thead.appendChild(row);
	return thead;
}

export function TableHeaderCell(text: string): HTMLTableCellElement {
	return el(
		"th",
		{ class: "text-left font-medium py-2 px-4 border-b" },
		text,
	);
}

export function TableBody(): HTMLTableSectionElement {
	return el("tbody");
}

export function TableRow(): HTMLTableRowElement {
	return el("tr", { class: "border-b" });
}

export function TableCell(className?: string): HTMLTableCellElement {
	return el("td", { class: cn("py-2 px-4", className) });
}
