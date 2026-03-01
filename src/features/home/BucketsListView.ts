import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@/components/ui/table.js";
import { buildStatusView } from "@/components/ui/status-view.js";
import { el } from "@/lib/dom.js";
import type { Bucket } from "@/lib/storage/service.js";
import { Hash } from "effect";

import { mountDeleteBucketButton } from "./DeleteBucketButton.js";
import type { BucketsState } from "./homeState.js";

export type BucketsListView = {
	wrapper: HTMLDivElement;
	render: (state: BucketsState) => void;
	cleanup: () => void;
};

type RowEntry = {
	tr: HTMLTableRowElement;
	nameTd: HTMLTableCellElement;
	publicTd: HTMLTableCellElement;
	dateTd: HTMLTableCellElement;
	actionsTd: HTMLTableCellElement;
};

const COLUMNS = ["Name", "ID", "Public", "Created", "Actions"];

function buildBucketRow(bucket: Bucket): RowEntry {
	const tr = TableRow();
	tr.dataset.bucketId = bucket.id;

	const nameTd = TableCell("font-medium");
	const idTd = TableCell("font-mono text-sm text-muted-foreground");
	idTd.textContent = bucket.id;
	const publicTd = TableCell();
	const dateTd = TableCell();
	const actionsTd = TableCell();

	tr.append(nameTd, idTd, publicTd, dateTd, actionsTd);
	return { tr, nameTd, publicTd, dateTd, actionsTd };
}

function renderBucketRow(
	entry: RowEntry,
	bucket: Bucket,
	onDeleteBucket: (id: string) => void,
	prevDeleteCleanup?: () => void,
): () => void {
	prevDeleteCleanup?.();
	entry.nameTd.textContent = bucket.name;
	entry.publicTd.textContent = bucket.public ? "Yes" : "No";
	entry.dateTd.textContent = new Date(bucket.created_at).toLocaleDateString();
	return mountDeleteBucketButton(entry.actionsTd, bucket, onDeleteBucket);
}

export function buildBucketsListView(
	onDeleteBucket: (id: string) => void,
): BucketsListView {
	const loadingEl = el(
		"p",
		{ class: "text-muted-foreground" },
		"Loading buckets...",
	);
	const errorEl = el(
		"p",
		{ class: "text-destructive" },
		"Failed to load buckets. Check your credentials and try again.",
	);
	const emptyEl = el(
		"p",
		{ class: "text-muted-foreground" },
		"No buckets found.",
	);

	const tbody = TableBody();
	const table = Table();
	table.append(TableHead(COLUMNS), tbody);

	const { wrapper, show } = buildStatusView({
		loading: loadingEl,
		error: errorEl,
		empty: emptyEl,
		ready: table,
	});

	const deleteBtnCleanups = new Map<string, () => void>();
	const fingerprints = new Map<string, number>();
	const rows = new Map<string, RowEntry>();

	function removeRow(id: string) {
		deleteBtnCleanups.get(id)?.();
		deleteBtnCleanups.delete(id);
		fingerprints.delete(id);
		rows.get(id)?.tr.remove();
		rows.delete(id);
	}

	function clearRows(keepIds?: Set<string>) {
		for (const id of [...rows.keys()]) {
			if (!keepIds || !keepIds.has(id)) removeRow(id);
		}
	}

	function render(state: BucketsState) {
		if (state.status === "loading") {
			show("loading");
			clearRows();
			return;
		}

		if (state.status === "error") {
			show("error");
			clearRows();
			return;
		}

		const buckets = state.data;
		const currentIds = new Set(buckets.map((b) => b.id));
		clearRows(currentIds);

		if (buckets.length === 0) {
			show("empty");
			return;
		}

		show("ready");

		for (const bucket of buckets) {
			const h = Hash.hash(bucket);
			if (fingerprints.get(bucket.id) === h) continue;

			if (rows.has(bucket.id)) {
				const entry = rows.get(bucket.id)!;
				deleteBtnCleanups.set(
					bucket.id,
					renderBucketRow(
						entry,
						bucket,
						onDeleteBucket,
						deleteBtnCleanups.get(bucket.id),
					),
				);
			} else {
				const entry = buildBucketRow(bucket);
				deleteBtnCleanups.set(
					bucket.id,
					renderBucketRow(entry, bucket, onDeleteBucket),
				);
				tbody.appendChild(entry.tr);
				rows.set(bucket.id, entry);
			}

			fingerprints.set(bucket.id, h);
		}
	}

	return { wrapper, render, cleanup: clearRows };
}
