import { Effect, Scope } from "effect";

import { type NavigationService } from "@/app/navigation.js";
import type { RouteContext } from "@/app/router.js";

export const sqlRoute = {
	path: "/sql",
	redirect: (ctx: RouteContext) => {
		if (ctx.credentialsStore.getSnapshot().status === "unknown")
			return "/credentials";
		return null;
	},
	mount: (container: Element, ctx: RouteContext) =>
		mountSqlPage(container, ctx),
};

function mountSqlPage(
	container: Element,
	ctx: RouteContext,
): Effect.Effect<void, never, Scope.Scope | NavigationService> {
	return Effect.gen(function* () {});
}
