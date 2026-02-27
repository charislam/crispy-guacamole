import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { credentialsStore } from "@/lib/credentials/credentials-store.js";

export type RouterContext = {
	credentialsStore: typeof credentialsStore;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<div className="min-h-screen bg-background">
			<Outlet />
		</div>
	),
});
