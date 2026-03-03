import { el } from "@/lib/dom.js";
import type { FolderNodeState } from "./bucketPageState.js";
import alertSvg from "./icons/alert.svg?raw";
import chevronDownSvg from "./icons/chevron-down.svg?raw";
import chevronRightSvg from "./icons/chevron-right.svg?raw";
import fileSvg from "./icons/file.svg?raw";
import folderSvg from "./icons/folder.svg?raw";
import loaderSvg from "./icons/loader.svg?raw";

export type FolderNodeView = {
	row: HTMLDivElement;
	chevron: HTMLSpanElement;
	childrenContainer: HTMLDivElement;
};

export type FileNodeView = {
	row: HTMLDivElement;
};

function DANGEROUS_svgIcon(svg: string, className: string): HTMLSpanElement {
	const span = document.createElement("span");
	span.className = className;
	span.innerHTML = svg;
	return span;
}

const CHEVRON_CLASS =
	"inline-flex items-center justify-center w-3.5 h-3.5 shrink-0 text-muted-foreground";

export function buildFolderNodeView(
	name: string,
	depth: number,
): FolderNodeView {
	const chevron = DANGEROUS_svgIcon(chevronRightSvg, CHEVRON_CLASS);
	chevron.dataset.state = "collapsed";
	const folderIcon = DANGEROUS_svgIcon(
		folderSvg,
		"inline-flex items-center justify-center w-4 h-4 shrink-0 text-amber-500/80",
	);
	const label = el("span", { class: "truncate min-w-0 font-medium" }, name);

	const row = el(
		"div",
		{
			class:
				"flex items-center gap-1.5 rounded-md cursor-pointer hover:bg-accent/60 text-sm select-none transition-colors",
			style: `padding-top: 4px; padding-bottom: 4px; padding-left: ${depth * 16 + 8}px; padding-right: 8px`,
		},
		chevron,
		folderIcon,
		label,
	);

	const childrenContainer = el("div", {});

	return { row, chevron, childrenContainer };
}

export function buildFileNodeView(name: string, depth: number): FileNodeView {
	const spacer = el("span", { class: "inline-block w-3.5 shrink-0" });
	const fileIcon = DANGEROUS_svgIcon(
		fileSvg,
		"inline-flex items-center justify-center w-4 h-4 shrink-0 text-muted-foreground/50",
	);
	const label = el(
		"span",
		{ class: "truncate min-w-0 text-muted-foreground" },
		name,
	);

	const row = el(
		"div",
		{
			class: "flex items-center gap-1.5 text-sm",
			style: `padding-top: 4px; padding-bottom: 4px; padding-left: ${depth * 16 + 8}px; padding-right: 8px`,
		},
		spacer,
		fileIcon,
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
			chevron.innerHTML = chevronRightSvg;
			chevron.className = CHEVRON_CLASS;
			chevron.dataset.state = "collapsed";
			break;
		case "loading":
			chevron.innerHTML = loaderSvg;
			chevron.className = `${CHEVRON_CLASS} animate-spin`;
			chevron.dataset.state = "loading";
			break;
		case "expanded":
			chevron.innerHTML = chevronDownSvg;
			chevron.className = CHEVRON_CLASS;
			chevron.dataset.state = "expanded";
			break;
		case "error":
			chevron.innerHTML = alertSvg;
			chevron.className =
				"inline-flex items-center justify-center w-3.5 h-3.5 shrink-0 text-destructive";
			chevron.dataset.state = "error";
			break;
	}
}
