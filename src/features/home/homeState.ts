import { Effect } from "effect";
import type { Signal } from "@preact/signals-core";

import type { AppRuntimeFactory } from "@/lib/app/runtime-context.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import {
	SupabaseStorageService,
	type Bucket,
	type StorageRequestError,
} from "@/lib/storage/service.js";

export type BucketsState =
	| { status: "loading" }
	| { status: "ready"; data: Bucket[] }
	| { status: "error"; error: StorageRequestError };

export type CreateBucketStatus = "idle" | "pending" | "success" | "error";
export type DeleteBucketStatus = "idle" | "pending" | "success" | "error";

export function loadBuckets(
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	bucketsState: Signal<BucketsState>,
): () => void {
	bucketsState.value = { status: "loading" };
	const runtime = runtimeFactory(credentials);
	let cancelled = false;

	const program = Effect.gen(function* () {
		const storage = yield* SupabaseStorageService;
		return yield* storage.listBuckets();
	}).pipe(
		Effect.match({
			onSuccess: (data): BucketsState => ({ status: "ready", data }),
			onFailure: (error): BucketsState => ({ status: "error", error }),
		}),
	);

	runtime.runPromise(program).then((state) => {
		if (!cancelled) bucketsState.value = state;
	});

	return () => {
		cancelled = true;
		void runtime.dispose();
	};
}

export function createBucket(
	name: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	status: Signal<CreateBucketStatus>,
	onSuccess: () => void,
): void {
	status.value = "pending";
	const runtime = runtimeFactory(credentials);

	const program = Effect.gen(function* () {
		const storage = yield* SupabaseStorageService;
		yield* storage.createBucket(name);
	}).pipe(
		Effect.match({
			onSuccess: () => "success" as const,
			onFailure: () => "error" as const,
		}),
	);

	runtime.runPromise(program).then((nextStatus) => {
		status.value = nextStatus;
		void runtime.dispose();
		if (nextStatus === "success") onSuccess();
	});
}

export function deleteBucket(
	id: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	status: Signal<DeleteBucketStatus>,
	onSuccess: () => void,
): void {
	status.value = "pending";
	const runtime = runtimeFactory(credentials);

	const program = Effect.gen(function* () {
		const storage = yield* SupabaseStorageService;
		yield* storage.deleteBucket(id);
	}).pipe(
		Effect.match({
			onSuccess: () => "success" as const,
			onFailure: () => "error" as const,
		}),
	);

	runtime.runPromise(program).then((nextStatus) => {
		status.value = nextStatus;
		void runtime.dispose();
		if (nextStatus === "success") onSuccess();
	});
}
