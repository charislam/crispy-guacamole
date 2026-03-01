import { Effect, Scope, SubscriptionRef } from "effect";

import type { RouteContext } from "@/app/router.js";
import { Button } from "@/components/ui/button.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { makePanel } from "@/lib/panel.js";
import { mountCreateBucketForm } from "./CreateBucketForm.js";
import type { CreateBucketStatus } from "./storageState.js";
import * as storageState from "./storageState.js";

export function mountBucketCreation(
	bucketActionsSlot: Element,
	formContainer: Element,
	credentials: KnownCredentialsState["credentials"],
	runtimeFactory: RouteContext["runtimeFactory"],
	refreshBuckets: Effect.Effect<void>,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.acquireRelease(
		Effect.sync(() => {
			const addBucketBtn = Button("Add bucket");
			const cancelBtn = Button("Cancel", { variant: "outline" });
			bucketActionsSlot.appendChild(addBucketBtn);
			return { addBucketBtn, cancelBtn };
		}),
		({ addBucketBtn }) => Effect.sync(() => addBucketBtn.remove()),
	).pipe(
		Effect.andThen(({ addBucketBtn, cancelBtn }) =>
			Effect.gen(function* () {
				const createBucketStatusRef =
					yield* SubscriptionRef.make<CreateBucketStatus>("idle");

				const panel = yield* makePanel();

				const onCreateBucket = (name: string): Effect.Effect<void> =>
					Effect.gen(function* () {
						const status = yield* storageState.createBucket(
							name,
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
						mountAddBucketForm(
							formContainer,
							bucketActionsSlot,
							addBucketBtn,
							cancelBtn,
							onCreateBucket,
							createBucketStatusRef,
						),
					),
				);

				cancelBtn.addEventListener("click", panel.hide);
			}),
		),
	);
}

function mountAddBucketForm(
	formContainer: Element,
	bucketActionsSlot: Element,
	addBucketBtn: Element,
	cancelBtn: Element,
	onCreateBucket: (name: string) => Effect.Effect<void>,
	createBucketStatusRef: SubscriptionRef.SubscriptionRef<CreateBucketStatus>,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.acquireRelease(
		Effect.sync(() => bucketActionsSlot.replaceChildren(cancelBtn)),
		() => Effect.sync(() => bucketActionsSlot.replaceChildren(addBucketBtn)),
	).pipe(
		Effect.andThen(
			mountCreateBucketForm(formContainer, onCreateBucket, createBucketStatusRef),
		),
	);
}
