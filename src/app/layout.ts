import { Effect } from "effect";

import { el } from "@/lib/dom.js";
import { cn } from "@/lib/utils.js";
import { Navigation } from "./navigation.js";
import type { Layout } from "./router";

const navLinks = [
	{ path: "/", label: "Home" },
	{ path: "/storage", label: "Storage" },
];

export const AppLayout: Layout = {
	mount: (container) =>
		Effect.gen(function* () {
			const navigation = yield* Navigation;

			const nav = el(
				"nav",
				{
					class: "border-b border-border bg-background",
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
								class:
									"text-lg font-semibold text-foreground",
							},
							"App",
						),
					),
					...navLinks.map((link) => {
						const isActive = window.location.pathname === link.path;
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
					}),
				),
			);

			const outlet = document.createElement("div");

			container.appendChild(nav);
			container.appendChild(outlet);
			return { outlet };
		}),
};
