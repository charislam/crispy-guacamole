import { Effect, Scope, Stream, SubscriptionRef } from "effect";

import type { RouteContext } from "@/app/router.js";
import { Button } from "@/components/ui/button.js";
import { el } from "@/lib/dom.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { makePanel } from "@/lib/panel.js";
import { mountCreateBucketForm } from "./CreateBucketForm.js";
import type { CreateBucketStatus } from "./storageState.js";
import * as storageState from "./storageState.js";

export function mountBucketCreation(
	bucketActionsSlot: Element,
	credentials: KnownCredentialsState["credentials"],
	runtimeFactory: RouteContext["runtimeFactory"],
	refreshBuckets: Effect.Effect<void>,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.acquireRelease(
		Effect.sync(() => {
			const addBucketBtn = Button("Add bucket");
			bucketActionsSlot.appendChild(addBucketBtn);
			return { addBucketBtn };
		}),
		({ addBucketBtn }) => Effect.sync(() => addBucketBtn.remove()),
	).pipe(
		Effect.andThen(({ addBucketBtn }) =>
			Effect.gen(function* () {
				const createBucketStatusRef =
					yield* SubscriptionRef.make<CreateBucketStatus>("idle");

				const panel = yield* makePanel();

				const onCreateBucket = (
					name: string,
					isPublic: boolean,
				): Effect.Effect<void> =>
					Effect.gen(function* () {
						const status = yield* storageState.createBucket(
							name,
							isPublic,
							credentials,
							runtimeFactory,
							createBucketStatusRef,
						);
						if (status === "success") {
							yield* Effect.sync(panel.hide);
							yield* refreshBuckets;
						}
					});

				addBucketBtn.addEventListener("click", () =>
					panel.show(
						mountAddBucketModal(
							onCreateBucket,
							createBucketStatusRef,
							panel.hide,
						),
					),
				);
			}),
		),
	);
}

function mountAddBucketModal(
	onCreateBucket: (name: string, isPublic: boolean) => Effect.Effect<void>,
	statusRef: SubscriptionRef.SubscriptionRef<CreateBucketStatus>,
	onCancel: () => void,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.gen(function* () {
		const controller = new AbortController();

		const { formSlot } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const formSlot = el("div", {});

				const dialog = document.createElement("dialog");
				dialog.className = "rounded-lg p-6 shadow-xl max-w-md w-full m-auto";
				dialog.append(
					el("h2", { class: "text-lg font-semibold mb-4" }, "Add bucket"),
					formSlot,
				);
				document.body.appendChild(dialog);
				dialog.showModal();

				return { formSlot, dialog };
			}),
			({ dialog }) =>
				Effect.sync(() => {
					controller.abort();
					dialog.close();
					dialog.remove();
				}),
		);

		yield* mountCreateBucketForm(formSlot, onCreateBucket, statusRef, onCancel);
	});
}
