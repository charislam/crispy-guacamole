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
		{ class: "mb-4" },
		el("h1", { class: "text-2xl font-bold" }, bucketId),
	);

	const loadingEl = el(
		"p",
		{ class: "text-muted-foreground text-sm" },
		"Loading files…",
	);
	const errorEl = el(
		"p",
		{ class: "text-destructive text-sm" },
		"Failed to load files. Check your credentials and try again.",
	);
	const emptyEl = el(
		"p",
		{ class: "text-muted-foreground text-sm" },
		"This bucket is empty.",
	);
	const treeContainer = el("div", { class: "font-mono text-sm" });

	const { wrapper, show } = buildStatusView({
		loading: loadingEl,
		error: errorEl,
		empty: emptyEl,
		ready: treeContainer,
	});

	const outer = el(
		"div",
		{ class: "container mx-auto py-10 px-4 max-w-3xl" },
		header,
		wrapper,
	);

	return { outer, treeContainer, show };
}
