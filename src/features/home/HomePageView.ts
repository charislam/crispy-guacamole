import { Button } from "@/components/ui/button.js";
import { Card, CardHeader } from "@/components/ui/card.js";
import { el } from "@/lib/dom.js";

export type HomePageViewElements = {
	outer: HTMLDivElement;
	credentialsBtn: HTMLButtonElement;
	viewStorageBtn: HTMLButtonElement;
	countEl: HTMLElement;
};

export function buildHomePageView(): HomePageViewElements {
	const credentialsBtn = Button("Change credentials", { variant: "outline" });

	const header = el(
		"div",
		{ class: "flex items-center justify-between mb-6" },
		el("h1", { class: "text-2xl font-bold" }, "Dashboard"),
		credentialsBtn,
	);

	const countEl = el(
		"p",
		{ class: "text-4xl font-bold tabular-nums text-center my-4" },
		"—",
	);
	const label = el(
		"p",
		{ class: "text-sm text-muted-foreground text-center" },
		"buckets total",
	);

	const viewStorageBtn = Button("View Storage →");

	const card = Card(
		[
			CardHeader("Storage Buckets", "Your Supabase storage buckets"),
			countEl,
			label,
			el("div", { class: "flex justify-center mt-4" }, viewStorageBtn),
		],
		"max-w-full",
	);

	const outer = el(
		"div",
		{ class: "container mx-auto py-10 px-4 max-w-3xl" },
		header,
		card,
	);

	return { outer, credentialsBtn, viewStorageBtn, countEl };
}
