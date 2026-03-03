import { Effect, Scope } from "effect";

import type { AppRuntimeFactory } from "@/lib/app/runtime.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import type { StorageItem } from "@/lib/storage/service.js";
import { mountFileTreeNode } from "./FileTreeNode.js";

export function mountFileTree(
	container: Element,
	items: readonly StorageItem[],
	bucketId: string,
	basePath: string,
	depth: number,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.forEach(items, (item) =>
		mountFileTreeNode(
			container,
			item,
			bucketId,
			basePath,
			depth,
			credentials,
			runtimeFactory,
		),
	).pipe(Effect.asVoid);
}
