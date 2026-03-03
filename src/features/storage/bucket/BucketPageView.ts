import { buildStatusView } from "@/components/ui/status-view.js";
import { el } from "@/lib/dom.js";

export type BucketPageViewElements = {
	outer: HTMLDivElement;
	treeContainer: HTMLDivElement;
	show: (key: "loading" | "error" | "empty" | "ready") => void;
};

export function buildBucketPageView(bucketId: string): BucketPageViewElements {
	const header = el(
		"div",
		{ class: "mb-6" },
		el("h1", { class: "text-xl font-semibold tracking-tight" }, bucketId),
	);

	const loadingEl = el(
		"div",
		{ class: "px-4 py-6 text-sm text-muted-foreground" },
		"Loading files…",
	);
	const errorEl = el(
		"div",
		{ class: "mx-4 my-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" },
		"Failed to load files. Check your credentials and try again.",
	);
	const emptyEl = el(
		"div",
		{ class: "px-4 py-10 text-center text-sm text-muted-foreground" },
		"This bucket is empty.",
	);
	const treeContainer = el("div", { class: "py-1" });

	const { wrapper, show } = buildStatusView({
		loading: loadingEl,
		error: errorEl,
		empty: emptyEl,
		ready: treeContainer,
	});

	const card = el(
		"div",
		{ class: "rounded-lg border bg-card shadow-sm overflow-hidden" },
		el(
			"div",
			{ class: "flex items-center gap-2 border-b bg-muted/40 px-4 py-2" },
			el("span", { class: "text-xs font-medium uppercase tracking-wide text-muted-foreground" }, "Files"),
		),
		wrapper,
	);

	const outer = el(
		"div",
		{ class: "container mx-auto max-w-3xl px-4 py-8" },
		header,
		card,
	);

	return { outer, treeContainer, show };
}
