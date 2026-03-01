import { Effect, Scope, Stream, SubscriptionRef } from "effect";

import { buildCreateBucketFormView } from "./CreateBucketFormView.js";
import type { CreateBucketStatus } from "./homeState.js";

export function mountCreateBucketForm(
	container: Element,
	onSubmit: (name: string) => Effect.Effect<void>,
	statusRef: SubscriptionRef.SubscriptionRef<CreateBucketStatus>,
): Effect.Effect<void, never, Scope.Scope> {
	return Effect.gen(function* () {
		const controller = new AbortController();

		const { form, submitBtn } = yield* Effect.acquireRelease(
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

		const handleSubmit = (e: Event) => {
			e.preventDefault();
			const name = new FormData(form).get("bucket-name") as string;
			Effect.runFork(onSubmit(name));
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
