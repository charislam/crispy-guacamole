import { Effect, Stream } from "effect";

import {
	buildNavView,
	desktopLinkBase,
	mobileLinkBase,
} from "@/features/navigation/NavigationView.js";
import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";
import { Navigation, NavigationEvents } from "./navigation.js";
import type { Layout } from "./router";

export const AppLayout: Layout = {
	mount: (container) =>
		Effect.gen(function* () {
			const navigation = yield* Navigation;
			const navEventsRef = yield* NavigationEvents;

			const navigate = (path: string) =>
				Effect.runFork(navigation.navigate(path));

			const { nav, navLinks, mobileLinkEls } = buildNavView(navigate);

			const updateActiveLinks = (currentPath: string) => {
				navLinks.forEach((link) => {
					link.className = cn(
						desktopLinkBase,
						currentPath === link.getAttribute("href")
							? "text-foreground"
							: "text-muted-foreground",
					);
				});
				mobileLinkEls.forEach((link) => {
					link.className = cn(
						mobileLinkBase,
						currentPath === link.getAttribute("href")
							? "bg-accent text-accent-foreground"
							: "text-muted-foreground",
					);
				});
			};

			yield* navEventsRef.changes.pipe(
				Stream.runForEach((path) => Effect.sync(() => updateActiveLinks(path))),
				Effect.forkScoped,
			);

			const outlet = el("div", {
				class: "flex-grow flex",
			});

			container.appendChild(nav);
			container.appendChild(outlet);
			return { outlet };
		}),
};
