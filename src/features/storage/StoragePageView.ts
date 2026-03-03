import { Button } from "@/components/ui/button.js";
import { el } from "@/lib/dom.js";

export type StoragePageViewElements = {
	outer: HTMLDivElement;
	credentialsBtn: HTMLButtonElement;
	bucketActionsSlot: HTMLDivElement;
	listContainer: HTMLDivElement;
};

export function buildStoragePageView(): StoragePageViewElements {
	const credentialsBtn = Button("Change credentials", { variant: "outline" });
	const bucketActionsSlot = el("div", {});

	const header = el(
		"div",
		{ class: "flex items-center justify-between mb-6" },
		el("h1", { class: "text-2xl font-bold" }, "Storage Buckets"),
		el("div", { class: "flex gap-2" }, credentialsBtn, bucketActionsSlot),
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
		credentialsBtn,
		bucketActionsSlot,
		listContainer,
	};
}
