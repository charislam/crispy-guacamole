import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";

export function Table(): HTMLTableElement {
	return el("table", { class: "w-full text-sm block sm:table" });
}

export function TableHead(columns: string[]): HTMLTableSectionElement {
	const thead = el("thead", { class: "hidden sm:table-header-group" });
	const row = el("tr");
	for (const col of columns) {
		row.appendChild(TableHeaderCell(col));
	}
	thead.appendChild(row);
	return thead;
}

export function TableHeaderCell(text: string): HTMLTableCellElement {
	return el("th", { class: "text-left font-medium py-2 px-4 border-b" }, text);
}

export function TableBody(): HTMLTableSectionElement {
	return el("tbody", { class: "flex flex-col gap-4 sm:table-row-group" });
}

export function TableRow(): HTMLTableRowElement {
	return el("tr", { class: "flex flex-col py-3 border-b sm:table-row sm:py-0" });
}

export function TableCell(className?: string, label?: string): HTMLTableCellElement {
	const td = el("td", {
		class: cn(
			"py-0.5 px-4 sm:table-cell sm:py-2",
			label &&
				"before:content-[attr(data-label)] before:font-medium before:mr-1 sm:before:hidden",
			className,
		),
	});
	if (label) td.dataset.label = `${label}: `;
	return td;
}
