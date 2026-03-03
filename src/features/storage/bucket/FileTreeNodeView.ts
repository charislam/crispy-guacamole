import { el } from "@/lib/dom.js";
import type { FolderNodeState } from "./bucketPageState.js";

export type FolderNodeView = {
	row: HTMLDivElement;
	chevron: HTMLSpanElement;
	childrenContainer: HTMLDivElement;
};

export type FileNodeView = {
	row: HTMLDivElement;
};

export function buildFolderNodeView(
	name: string,
	depth: number,
): FolderNodeView {
	const chevron = el(
		"span",
		{ class: "inline-block w-4 shrink-0 text-xs text-muted-foreground" },
		"▶",
	);
	const label = el("span", { class: "truncate min-w-0" }, name);

	const row = el(
		"div",
		{
			class: "flex items-center gap-1 py-0.5 rounded cursor-pointer hover:bg-accent text-sm select-none",
			style: `padding-left: ${depth * 16 + 8}px; padding-right: 8px`,
		},
		chevron,
		label,
	);

	const childrenContainer = el("div", {});

	return { row, chevron, childrenContainer };
}

export function buildFileNodeView(name: string, depth: number): FileNodeView {
	const spacer = el("span", { class: "inline-block w-4 shrink-0" });
	const label = el("span", { class: "truncate min-w-0 text-muted-foreground" }, name);

	const row = el(
		"div",
		{
			class: "flex items-center gap-1 py-0.5 text-sm",
			style: `padding-left: ${depth * 16 + 8}px; padding-right: 8px`,
		},
		spacer,
		label,
	);

	return { row };
}

export function updateChevron(
	chevron: HTMLSpanElement,
	state: FolderNodeState,
): void {
	switch (state.status) {
		case "collapsed":
			chevron.textContent = "▶";
			break;
		case "loading":
			chevron.textContent = "…";
			break;
		case "expanded":
			chevron.textContent = "▼";
			break;
		case "error":
			chevron.textContent = "⚠";
			break;
	}
}
