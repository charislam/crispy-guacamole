import { effect } from "@preact/signals-core";
import type { Signal } from "@preact/signals-core";

import { el } from "@/lib/dom.js";
import { mountDeleteBucketButton } from "./DeleteBucketButton.js";
import type { BucketsState } from "./homeState.js";

export function mountBucketsList(
	container: Element,
	bucketsState: Signal<BucketsState>,
	onDeleteBucket: (id: string) => void,
): () => void {
	// Loading state
	const loadingEl = el(
		"p",
		{ class: "text-muted-foreground" },
		"Loading buckets...",
	);

	// Error state
	const errorEl = el("p", { class: "text-destructive" });

	// Table
	const table = el("table", { class: "w-full text-sm" });
	const thead = el("thead");
	const headerRow = el("tr");
	for (const text of ["Name", "ID", "Public", "Created", "Actions"]) {
		const th = el(
			"th",
			{ class: "text-left font-medium py-2 px-4 border-b" },
			text,
		);
		headerRow.appendChild(th);
	}
	thead.appendChild(headerRow);
	const tbody = el("tbody");
	table.append(thead, tbody);

	// Empty state
	const emptyEl = el(
		"p",
		{ class: "text-muted-foreground" },
		"No buckets found.",
	);

	container.append(loadingEl, errorEl, table, emptyEl);

	// Track delete button cleanup by bucket id
	const deleteBtnCleanups = new Map<string, () => void>();

	function clearRows(keepIds?: Set<string>) {
		for (const [id, cleanup] of deleteBtnCleanups) {
			if (!keepIds || !keepIds.has(id)) {
				cleanup();
				deleteBtnCleanups.delete(id);
			}
		}
		for (const row of Array.from(tbody.querySelectorAll("tr"))) {
			const id = (row as HTMLElement).dataset.bucketId;
			if (!keepIds || (id && !keepIds.has(id))) row.remove();
		}
	}

	const stopEffect = effect(() => {
		const state = bucketsState.value;

		loadingEl.hidden = state.status !== "loading";
		errorEl.hidden = state.status !== "error";
		table.hidden = state.status !== "ready";
		emptyEl.hidden = true;

		if (state.status === "loading") {
			// Rows will be reconciled when ready; leave them for now but they're hidden
		}

		if (state.status === "error") {
			errorEl.textContent =
				"Failed to load buckets. Check your credentials and try again.";
			clearRows();
		}

		if (state.status === "ready") {
			const buckets = state.data;
			const currentIds = new Set(buckets.map((b) => b.id));

			// Always reconcile: remove rows no longer in the list
			clearRows(currentIds);

			if (buckets.length === 0) {
				table.hidden = true;
				emptyEl.hidden = false;
			} else {
				table.hidden = false;

				// Determine which rows already exist
				const existingIds = new Set(
					Array.from(tbody.querySelectorAll("tr")).map(
						(r) => (r as HTMLElement).dataset.bucketId ?? "",
					),
				);

				// Add rows for new buckets
				for (const bucket of buckets) {
					if (existingIds.has(bucket.id)) continue;

					const tr = el("tr", { class: "border-b" });
					tr.dataset.bucketId = bucket.id;

					const nameTd = el("td", { class: "py-2 px-4 font-medium" });
					nameTd.textContent = bucket.name;

					const idTd = el("td", {
						class: "py-2 px-4 font-mono text-sm text-muted-foreground",
					});
					idTd.textContent = bucket.id;

					const publicTd = el("td", { class: "py-2 px-4" });
					publicTd.textContent = bucket.public ? "Yes" : "No";

					const dateTd = el("td", { class: "py-2 px-4" });
					dateTd.textContent = new Date(
						bucket.created_at,
					).toLocaleDateString();

					const actionsTd = el("td", { class: "py-2 px-4" });
					const deleteCleanup = mountDeleteBucketButton(
						actionsTd,
						bucket,
						onDeleteBucket,
					);
					deleteBtnCleanups.set(bucket.id, deleteCleanup);

					tr.append(nameTd, idTd, publicTd, dateTd, actionsTd);
					tbody.appendChild(tr);
				}
			}
		}
	});

	return () => {
		stopEffect();
		clearRows();
		loadingEl.remove();
		errorEl.remove();
		table.remove();
		emptyEl.remove();
	};
}
