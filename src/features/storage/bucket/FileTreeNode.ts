import { Effect, Exit, Fiber, Scope, Stream, SubscriptionRef } from "effect";

import type { AppRuntimeFactory } from "@/lib/app/runtime.js";
import type { SupabaseCredentials } from "@/lib/credentials/types.js";
import type { StorageItem } from "@/lib/storage/service.js";
import { loadFolderFiles, type FolderNodeState } from "./bucketPageState.js";
import {
	buildFileNodeView,
	buildFolderNodeView,
	updateChevron,
} from "./FileTreeNodeView.js";
import { mountFileTree } from "./FileTree.js";

function joinPath(parent: string, name: string): string {
	return parent === "" ? name : `${parent}/${name}`;
}

type FolderMutableState = {
	loadingFiber: Fiber.RuntimeFiber<void, never> | null;
	childScope: Scope.CloseableScope | null;
};

function makeFolderStateHandler(
	state: FolderMutableState,
	childrenContainer: Element,
	chevron: HTMLSpanElement,
	bucketId: string,
	itemPath: string,
	depth: number,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
) {
	return (folderState: FolderNodeState) =>
		Effect.gen(function* () {
			if (state.childScope) {
				yield* Scope.close(state.childScope, Exit.void);
				state.childScope = null;
				childrenContainer.replaceChildren();
			}
			updateChevron(chevron, folderState);
			if (folderState.status === "expanded") {
				state.childScope = yield* Scope.make();
				yield* Effect.provideService(
					mountFileTree(
						childrenContainer,
						folderState.children,
						bucketId,
						itemPath,
						depth + 1,
						credentials,
						runtimeFactory,
					),
					Scope.Scope,
					state.childScope,
				);
			}
		});
}

function makeFolderClickHandler(
	state: FolderMutableState,
	folderStateRef: SubscriptionRef.SubscriptionRef<FolderNodeState>,
	bucketId: string,
	itemPath: string,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
): () => void {
	return () => {
		const folderState = Effect.runSync(SubscriptionRef.get(folderStateRef));
		if (folderState.status === "loading") return;

		if (folderState.status === "expanded") {
			if (state.loadingFiber) {
				Effect.runFork(Fiber.interrupt(state.loadingFiber));
				state.loadingFiber = null;
			}
			Effect.runFork(
				SubscriptionRef.set(folderStateRef, {
					status: "collapsed",
					cachedChildren: folderState.children,
				}),
			);
			return;
		}

		// collapsed with cache → restore immediately without re-fetching
		if (folderState.status === "collapsed" && folderState.cachedChildren) {
			Effect.runFork(
				SubscriptionRef.set(folderStateRef, {
					status: "expanded",
					children: folderState.cachedChildren,
				}),
			);
			return;
		}

		// collapsed (no cache) or error → start loading
		if (state.loadingFiber) {
			Effect.runFork(Fiber.interrupt(state.loadingFiber));
		}
		state.loadingFiber = Effect.runFork(
			loadFolderFiles(
				bucketId,
				itemPath,
				credentials,
				runtimeFactory,
				folderStateRef,
			),
		);
	};
}

export function mountFileTreeNode(
	container: Element,
	item: StorageItem,
	bucketId: string,
	basePath: string,
	depth: number,
	credentials: SupabaseCredentials,
	runtimeFactory: AppRuntimeFactory,
): Effect.Effect<void, never, Scope.Scope> {
	const isFolder = item.id === null;

	if (!isFolder) {
		return Effect.acquireRelease(
			Effect.sync(() => {
				const { row } = buildFileNodeView(item.name, depth);
				container.appendChild(row);
				return row;
			}),
			(row) => Effect.sync(() => row.remove()),
		).pipe(Effect.asVoid);
	}

	// Folder node
	return Effect.gen(function* () {
		const itemPath = joinPath(basePath, item.name);
		const folderStateRef =
			yield* SubscriptionRef.make<FolderNodeState>({ status: "collapsed" });

		const { row, chevron, childrenContainer } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildFolderNodeView(item.name, depth);
				container.appendChild(view.row);
				container.appendChild(view.childrenContainer);
				return view;
			}),
			({ row, childrenContainer }) =>
				Effect.sync(() => {
					row.remove();
					childrenContainer.remove();
				}),
		);

		// childScope outlives mountFileTree so acquireRelease finalizers don't run early
		const state: FolderMutableState = { loadingFiber: null, childScope: null };

		yield* Effect.addFinalizer(() =>
			Effect.gen(function* () {
				if (state.loadingFiber) yield* Fiber.interrupt(state.loadingFiber);
				if (state.childScope) yield* Scope.close(state.childScope, Exit.void);
			}),
		);

		// Stream drives chevron updates and child tree lifecycle
		yield* folderStateRef.changes.pipe(
			Stream.runForEach(
				makeFolderStateHandler(
					state,
					childrenContainer,
					chevron,
					bucketId,
					itemPath,
					depth,
					credentials,
					runtimeFactory,
				),
			),
			Effect.forkScoped,
		);

		// Click handler: toggle collapsed ↔ expanded
		const handleClick = makeFolderClickHandler(
			state,
			folderStateRef,
			bucketId,
			itemPath,
			credentials,
			runtimeFactory,
		);

		const controller = new AbortController();
		yield* Effect.addFinalizer(() =>
			Effect.sync(() => controller.abort()),
		);
		row.addEventListener("click", handleClick, { signal: controller.signal });
	});
}
