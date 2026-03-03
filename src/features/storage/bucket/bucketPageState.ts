import { Effect, SubscriptionRef } from "effect";

import type { AppRuntimeFactory } from "@/lib/app/runtime.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import {
	SupabaseStorageService,
	type StorageItem,
} from "@/lib/storage/service.js";

export type FolderNodeState =
	| { status: "collapsed"; cachedChildren?: readonly StorageItem[] }
	| { status: "loading" }
	| { status: "expanded"; children: readonly StorageItem[] }
	| { status: "error" };

export type BucketPageState =
	| { status: "loading" }
	| { status: "ready"; rootItems: readonly StorageItem[] }
	| { status: "error" };

function runWithRuntime<A>(
	program: Effect.Effect<A, unknown, SupabaseStorageService>,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
): Effect.Effect<A, never> {
	return Effect.acquireUseRelease(
		Effect.sync(() => runtimeFactory(credentials)),
		(storageRuntime) =>
			Effect.async<A, never>((resume, signal) => {
				storageRuntime
					.runPromise(program as Effect.Effect<A>, { signal })
					.then((r) => resume(Effect.succeed(r)))
					.catch(() => {});
			}),
		(storageRuntime) => Effect.promise(() => storageRuntime.dispose()),
	);
}

export function loadBucketRoot(
	bucketId: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	stateRef: SubscriptionRef.SubscriptionRef<BucketPageState>,
): Effect.Effect<void> {
	return Effect.gen(function* () {
		yield* SubscriptionRef.set(stateRef, { status: "loading" });

		const program = Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			return yield* storage.listFiles(bucketId, "");
		}).pipe(
			Effect.match({
				onSuccess: (rootItems): BucketPageState => ({
					status: "ready",
					rootItems,
				}),
				onFailure: (): BucketPageState => ({ status: "error" }),
			}),
		);

		const result = yield* runWithRuntime(program, credentials, runtimeFactory);
		yield* SubscriptionRef.set(stateRef, result);
	});
}

export function loadFolderFiles(
	bucketId: string,
	prefix: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	stateRef: SubscriptionRef.SubscriptionRef<FolderNodeState>,
): Effect.Effect<void> {
	return Effect.gen(function* () {
		yield* SubscriptionRef.set(stateRef, { status: "loading" });

		const program = Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			return yield* storage.listFiles(bucketId, prefix);
		}).pipe(
			Effect.match({
				onSuccess: (children): FolderNodeState => ({
					status: "expanded",
					children,
				}),
				onFailure: (): FolderNodeState => ({ status: "error" }),
			}),
		);

		const result = yield* runWithRuntime(program, credentials, runtimeFactory);
		yield* SubscriptionRef.set(stateRef, result);
	});
}
