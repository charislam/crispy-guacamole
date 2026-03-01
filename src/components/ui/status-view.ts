import { el } from "@/lib/dom.js";

export type StatusViewSlots = {
	loading: HTMLElement;
	error: HTMLElement;
	empty: HTMLElement;
	ready: HTMLElement;
};

export type StatusViewKey = keyof StatusViewSlots;

export function buildStatusView(slots: StatusViewSlots): {
	wrapper: HTMLDivElement;
	show: (which: StatusViewKey) => void;
} {
	const ordered: HTMLElement[] = [
		slots.loading,
		slots.error,
		slots.empty,
		slots.ready,
	];
	for (const node of ordered) node.hidden = true;
	slots.loading.hidden = false;

	const wrapper = el("div", {}, ...ordered);

	return {
		wrapper,
		show(which) {
			for (const node of ordered) node.hidden = true;
			slots[which].hidden = false;
		},
	};
}
