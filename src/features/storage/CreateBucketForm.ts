import { Effect, Scope, Stream, SubscriptionRef } from "effect";

import { buildCreateBucketFormView } from "./CreateBucketFormView.js";
import type { CreateBucketStatus } from "./storageState.js";

export function mountCreateBucketForm(
	container: Element,
	onSubmit: (name: string, isPublic: boolean) => Effect.Effect<void>,
	statusRef: SubscriptionRef.SubscriptionRef<CreateBucketStatus>,
	onCancel: () => void,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.gen(function* () {
		const controller = new AbortController();

		const { form, submitBtn, cancelBtn } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildCreateBucketFormView();
				container.appendChild(view.form);
				return view;
			}),
			({ form }) =>
				Effect.sync(() => {
					controller.abort();
					form.remove();
				}),
		);

		cancelBtn.addEventListener("click", onCancel, {
			signal: controller.signal,
		});

		const handleSubmit = (e: Event) => {
			e.preventDefault();
			const data = new FormData(form);
			const name = data.get("bucket-name") as string;
			const isPublic = data.get("bucket-public") === "on";
			Effect.runFork(onSubmit(name, isPublic));
		};
		form.addEventListener("submit", handleSubmit, {
			signal: controller.signal,
		});

		yield* statusRef.changes.pipe(
			Stream.runForEach((s) =>
				Effect.sync(() => {
					submitBtn.disabled = s === "pending";
					submitBtn.textContent = s === "pending" ? "Creating..." : "Create";
				}),
			),
			Effect.forkScoped,
		);

		yield* Effect.never;
	});
}
