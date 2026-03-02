import { Effect, SubscriptionRef } from "effect";

import type { AppRuntimeFactory } from "@/lib/app/runtime.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import {
	SupabaseStorageService,
	type Bucket,
	type StorageRequestError,
	type StorageSchemaError,
} from "@/lib/storage/service.js";

export type BucketsState =
	| { status: "loading" }
	| { status: "ready"; data: readonly Bucket[] }
	| { status: "error"; error: StorageRequestError | StorageSchemaError };

export type CreateBucketStatus = "idle" | "pending" | "success" | "error";
export type DeleteBucketStatus = "idle" | "pending" | "success" | "error";

export function loadBuckets(
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	bucketsStateRef: SubscriptionRef.SubscriptionRef<BucketsState>,
): Effect.Effect<void> {
	return Effect.gen(function* () {
		yield* SubscriptionRef.set(bucketsStateRef, { status: "loading" });

		const program = Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			return yield* storage.listBuckets();
		}).pipe(
			Effect.match({
				onSuccess: (data): BucketsState => ({ status: "ready", data }),
				onFailure: (error): BucketsState => ({ status: "error", error }),
			}),
		);

		const result = yield* Effect.acquireUseRelease(
			Effect.sync(() => runtimeFactory(credentials)),
			(storageRuntime) =>
				Effect.async<BucketsState, never>((resume, signal) => {
					storageRuntime
						.runPromise(program, { signal })
						.then((r) => resume(Effect.succeed(r)))
						.catch(() => {});
				}),
			(storageRuntime) => Effect.promise(() => storageRuntime.dispose()),
		);

		yield* SubscriptionRef.set(bucketsStateRef, result);
	});
}

export function createBucket(
	name: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	statusRef: SubscriptionRef.SubscriptionRef<CreateBucketStatus>,
): Effect.Effect<CreateBucketStatus> {
	return Effect.gen(function* () {
		yield* SubscriptionRef.set(statusRef, "pending");

		const program = Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			yield* storage.createBucket(name);
		}).pipe(
			Effect.match({
				onSuccess: () => "success" as const,
				onFailure: () => "error" as const,
			}),
		);

		const nextStatus = yield* Effect.acquireUseRelease(
			Effect.sync(() => runtimeFactory(credentials)),
			(storageRuntime) =>
				Effect.async<CreateBucketStatus, never>((resume, signal) => {
					storageRuntime
						.runPromise(program, { signal })
						.then((r) => resume(Effect.succeed(r)))
						.catch(() => {});
				}),
			(storageRuntime) => Effect.promise(() => storageRuntime.dispose()),
		);

		yield* SubscriptionRef.set(statusRef, nextStatus);

		return nextStatus;
	});
}

export function deleteBucket(
	id: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
	statusRef: SubscriptionRef.SubscriptionRef<DeleteBucketStatus>,
): Effect.Effect<DeleteBucketStatus> {
	return Effect.gen(function* () {
		yield* SubscriptionRef.set(statusRef, "pending");

		const program = Effect.gen(function* () {
			const storage = yield* SupabaseStorageService;
			yield* storage.deleteBucket(id);
		}).pipe(
			Effect.match({
				onSuccess: () => "success" as const,
				onFailure: () => "error" as const,
			}),
		);

		const nextStatus = yield* Effect.acquireUseRelease(
			Effect.sync(() => runtimeFactory(credentials)),
			(storageRuntime) =>
				Effect.async<DeleteBucketStatus, never>((resume, signal) => {
					storageRuntime
						.runPromise(program, { signal })
						.then((r) => resume(Effect.succeed(r)))
						.catch(() => {});
				}),
			(storageRuntime) => Effect.promise(() => storageRuntime.dispose()),
		);

		yield* SubscriptionRef.set(statusRef, nextStatus);

		return nextStatus;
	});
}
