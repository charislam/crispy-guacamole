import { Effect } from "effect";
import { useCallback, useEffect, useState } from "react";

import { useRuntimeFactory } from "@/lib/app/runtime-context.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import type { Bucket, StorageRequestError } from "@/lib/storage/service.js";
import { SupabaseStorageService } from "@/lib/storage/service.js";

export type BucketsState =
	| { status: "loading" }
	| { status: "ready"; data: Bucket[] }
	| { status: "error"; error: StorageRequestError };

export function useBuckets(credentials: SupabaseCredentials) {
	const [listState, setState] = useState<BucketsState>({ status: "loading" });
	const [refreshKey, setRefreshKey] = useState(0);
	const runtimeFactory = useRuntimeFactory();
	const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

	useEffect(() => {
		setState({ status: "loading" });
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
			if (!cancelled) setState(state);
		});

		return () => {
			cancelled = true;
			void runtime.dispose();
		};
	}, [credentials, runtimeFactory, refreshKey]);

	return { state: listState, refresh };
}
