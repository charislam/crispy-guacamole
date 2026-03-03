import { el } from "@/lib/dom.js";

export type StoragePageViewElements = {
	outer: HTMLDivElement;
	bucketActionsSlot: HTMLDivElement;
	listContainer: HTMLDivElement;
};

export function buildStoragePageView(): StoragePageViewElements {
	const bucketActionsSlot = el("div", {});

	const header = el(
		"div",
		{ class: "flex items-center justify-between mb-6" },
		el("h1", { class: "text-2xl font-bold" }, "Storage Buckets"),
		el("div", {}, bucketActionsSlot),
	);

	const listContainer = el("div", {});

	const outer = el(
		"div",
		{ class: "container mx-auto py-10 px-4 max-w-3xl" },
		header,
		listContainer,
	);

	return {
		outer,
		bucketActionsSlot,
		listContainer,
	};
}
