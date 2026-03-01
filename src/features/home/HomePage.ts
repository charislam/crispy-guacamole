import { signal } from "@preact/signals-core";
import { effect } from "@preact/signals-core";

import { navigate } from "@/app/router.js";
import type { RouteContext } from "@/app/router.js";
import { el } from "@/lib/dom.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { mountBucketsList } from "./BucketsList.js";
import { mountCreateBucketForm } from "./CreateBucketForm.js";
import * as homeState from "./homeState.js";
import type { BucketsState, CreateBucketStatus } from "./homeState.js";

export const homeRoute = {
	path: "/",
	beforeLoad: (ctx: RouteContext) => {
		if (ctx.credentialsStore.getSnapshot().status === "unknown")
			return "/credentials";
		return null;
	},
	mount: (container: Element, ctx: RouteContext) =>
		mountHomePage(container, ctx),
};

function mountHomePage(container: Element, ctx: RouteContext): () => void {
	// beforeLoad guarantees status === "known"
	const snap = ctx.credentialsStore.getSnapshot() as KnownCredentialsState;
	const credentials = snap.credentials;

	const bucketsState = signal<BucketsState>({ status: "loading" });
	const showCreateForm = signal(false);
	const createBucketStatus = signal<CreateBucketStatus>("idle");

	// Outer container
	const outer = el("div", {
		class: "container mx-auto py-10 px-4 max-w-3xl",
	});

	// Header
	const header = el("div", { class: "flex items-center justify-between mb-6" });
	const h1 = el("h1", { class: "text-2xl font-bold" }, "Storage Buckets");
	const btnGroup = el("div", { class: "flex gap-2" });

	const credentialsBtn = el(
		"button",
		{ class: "inline-flex h-9 items-center rounded-md border px-3 text-sm" },
		"Change credentials",
	);
	credentialsBtn.addEventListener("click", () => navigate("/credentials"));

	const addBucketBtn = el(
		"button",
		{
			class: "inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground",
		},
		"Add bucket",
	);
	addBucketBtn.addEventListener("click", () => {
		showCreateForm.value = true;
	});

	const cancelBtn = el(
		"button",
		{ class: "inline-flex h-9 items-center rounded-md border px-3 text-sm" },
		"Cancel",
	);
	cancelBtn.addEventListener("click", () => {
		showCreateForm.value = false;
	});

	btnGroup.append(credentialsBtn, addBucketBtn);
	header.append(h1, btnGroup);
	outer.appendChild(header);

	// Form container
	const formContainer = el("div", {});
	outer.appendChild(formContainer);

	// Buckets list container
	const listContainer = el("div", {});
	outer.appendChild(listContainer);

	container.appendChild(outer);

	// Load buckets
	let stopBucketsLoad: (() => void) | null = null;
	const refreshBuckets = () => {
		stopBucketsLoad?.();
		stopBucketsLoad = homeState.loadBuckets(
			credentials,
			ctx.runtimeFactory,
			bucketsState,
		);
	};
	refreshBuckets();

	// Delete handler
	const onDeleteBucket = (id: string) => {
		const deleteStatus = signal<homeState.DeleteBucketStatus>("idle");
		homeState.deleteBucket(
			id,
			credentials,
			ctx.runtimeFactory,
			deleteStatus,
			refreshBuckets,
		);
	};

	// Create handler
	const onCreateBucket = (name: string) => {
		homeState.createBucket(
			name,
			credentials,
			ctx.runtimeFactory,
			createBucketStatus,
			() => {
				showCreateForm.value = false;
				refreshBuckets();
			},
		);
	};

	// Toggle form via effect
	let formCleanup: (() => void) | null = null;
	const stopFormEffect = effect(() => {
		if (showCreateForm.value) {
			btnGroup.replaceChildren(credentialsBtn, cancelBtn);
			if (!formCleanup) {
				formCleanup = mountCreateBucketForm(
					formContainer,
					onCreateBucket,
					createBucketStatus,
				);
			}
		} else {
			btnGroup.replaceChildren(credentialsBtn, addBucketBtn);
			formCleanup?.();
			formCleanup = null;
		}
	});

	// Mount buckets list
	const listCleanup = mountBucketsList(listContainer, bucketsState, onDeleteBucket);

	return () => {
		stopFormEffect();
		formCleanup?.();
		listCleanup();
		stopBucketsLoad?.();
		outer.remove();
	};
}
