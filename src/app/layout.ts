import { Effect } from "effect";

import type { Layout } from "./router";

export const AppLayout: Layout = {
	mount: (container) =>
		Effect.gen(function* () {
			const nav = document.createElement("nav");
			const outlet = document.createElement("div");
			container.appendChild(nav);
			container.appendChild(outlet);
			return { outlet };
		}),
};
