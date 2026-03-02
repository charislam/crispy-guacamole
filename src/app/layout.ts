import { Effect, Stream } from "effect";

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

			const linkEls = navLinks.map((link) => {
				const navLink = el(
					"a",
					{
						href: link.path,
						class: cn(
							"text-sm font-medium transition-colors hover:text-foreground",
						),
					},
					link.label,
				);

				navLink.addEventListener("click", (e) => {
					e.preventDefault();
					Effect.runFork(navigation.navigate(link.path));
				});

				return navLink;
			});

			const updateActiveLinks = (currentPath: string) => {
				navLinks.forEach((link, i) => {
					linkEls[i].className = cn(
						"text-sm font-medium transition-colors hover:text-foreground",
						currentPath === link.path
							? "text-foreground"
							: "text-muted-foreground",
					);
				});
			};

			yield* navEventsRef.changes.pipe(
				Stream.runForEach((path) => Effect.sync(() => updateActiveLinks(path))),
				Effect.forkScoped,
			);

			const nav = el(
				"nav",
				{
					class: "border-b border-border bg-background flex-0",
				},
				el(
					"div",
					{
						class: "container mx-auto flex h-14 items-center gap-6 px-4",
					},
					el(
						"div",
						{
							class: "flex items-center gap-2",
						},
						el(
							"span",
							{
								class: "text-lg font-semibold text-foreground",
							},
							"App",
						),
					),
					...linkEls,
				),
			);

			const outlet = el("div", {
				class: "flex-grow flex",
			});

			container.appendChild(nav);
			container.appendChild(outlet);
			return { outlet };
		}),
};
