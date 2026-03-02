import { el } from "@/lib/dom";
import { cn } from "@/lib/utils";

const navLinks = [
	{ path: "/", label: "Home" },
	{ path: "/storage", label: "Storage" },
	{ path: "/credentials", label: "Credentials" },
];

interface NavView {
	nav: HTMLElement;
	navLinks: Array<HTMLAnchorElement>;
}

export function buildNavView(): NavView {
	const navLinkEls = navLinks.map((link) => {
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

		return navLink;
	});

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
			...navLinkEls,
		),
	);

	return {
		nav,
		navLinks: navLinkEls,
	};
}
