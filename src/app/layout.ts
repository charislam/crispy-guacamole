import { Effect, Stream } from "effect";

import { buildNavView } from "@/features/navigation/NavigationView.js";
import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";
import { Navigation, NavigationEvents } from "./navigation.js";
import type { Layout } from "./router";

const navLinks = [
	{ path: "/", label: "Home" },
	{ path: "/storage", label: "Storage" },
];

export const AppLayout: Layout = {
	mount: (container) =>
		Effect.gen(function* () {
			const navigation = yield* Navigation;
			const navEventsRef = yield* NavigationEvents;

			const { nav, navLinks } = buildNavView();

			navLinks.forEach((link) => {
				link.addEventListener("click", (e) => {
					e.preventDefault();
					Effect.runFork(navigation.navigate(link.getAttribute("href")!));
				});

				return link;
			});

			const updateActiveLinks = (currentPath: string) => {
				navLinks.forEach((link) => {
					link.className = cn(
						"text-sm font-medium transition-colors hover:text-foreground",
						currentPath === link.getAttribute("href")
							? "text-foreground"
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
