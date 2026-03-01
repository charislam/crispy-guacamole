import { Effect, Runtime, Scope } from "effect";

import { Navigation, type NavigationService } from "@/app/navigation.js";
import type { RouteContext } from "@/app/router.js";
import { verifyCredentialsExisting } from "@/lib/credentials/store.js";
import { buildCredentialsView } from "./CredentialsView.js";

export const credentialsRoute = {
	path: "/credentials",
	mount: (container: Element, ctx: RouteContext) =>
		mountCredentialsPage(container, ctx),
};

function mountCredentialsPage(
	container: Element,
	ctx: RouteContext,
): Effect.Effect<void, never, Scope.Scope | NavigationService> {
	return Effect.gen(function* () {
		const nav = yield* Navigation;
		const escapedRuntime = yield* Effect.runtime<
			Scope.Scope | NavigationService
		>();

		const { form, urlInput } = yield* Effect.acquireRelease(
			Effect.sync(() => {
				const view = buildCredentialsView();
				container.appendChild(view.wrapper);
				return view;
			}),
			({ wrapper }) => Effect.sync(() => wrapper.remove()),
		);

		const snap = ctx.credentialsStore.getSnapshot();
		if (verifyCredentialsExisting(snap)) {
			urlInput.placeholder = snap.credentials.url;
		}

		yield* Effect.acquireRelease(
			Effect.sync(() => {
				const controller = new AbortController();
				const state = { mounted: true };

				const handleSubmit = (e: Event) => {
					e.preventDefault();
					const data = new FormData(form);
					const url = data.get("url") as string;
					const key = data.get("key") as string;
					Runtime.runFork(escapedRuntime)(
						ctx.credentialsStore
							.setCredentials(url, key)
							.pipe(
								Effect.andThen(() =>
									state.mounted ? nav.navigate("/") : Effect.void,
								),
							),
					);
				};

				form.addEventListener("submit", handleSubmit, {
					signal: controller.signal,
				});
				return { controller, state };
			}),
			({ controller, state }) =>
				Effect.sync(() => {
					state.mounted = false;
					controller.abort();
				}),
		);

		yield* Effect.never;
	});
}
