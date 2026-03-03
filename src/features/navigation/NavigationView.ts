import closeIconSvg from "./icons/close.svg?raw";
import menuIconSvg from "./icons/menu.svg?raw";
import { el } from "@/lib/dom";
import { cn } from "@/lib/utils";

const navLinks = [
	{ path: "/", label: "Home" },
	{ path: "/storage", label: "Storage" },
	{ path: "/credentials", label: "Credentials" },
];

export const desktopLinkBase =
	"hidden md:inline-flex text-sm font-medium transition-colors hover:text-foreground";
export const mobileLinkBase =
	"block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground";

interface MobileNavView {
	hamburgerBtn: HTMLButtonElement;
	mobileMenu: HTMLElement;
	mobileLinkEls: Array<HTMLAnchorElement>;
}

function buildMobileNavView(navigate: (path: string) => void): MobileNavView {
	const mobileLinkEls = navLinks.map((link) =>
		el(
			"a",
			{ href: link.path, class: cn(mobileLinkBase, "text-muted-foreground") },
			link.label,
		),
	);

	let mobileMenuOpen = false;

	const hamburgerBtn = el("button", {
		type: "button",
		"aria-label": "Toggle menu",
		class:
			"md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
	});
	hamburgerBtn.innerHTML = menuIconSvg;

	const mobileMenu = el(
		"div",
		{
			class: "md:hidden hidden border-t border-border bg-background",
			"data-testid": "mobile-menu",
		},
		el(
			"div",
			{ class: "container mx-auto px-4 py-3 flex flex-col gap-1" },
			...mobileLinkEls,
		),
	);

	const openMobileMenu = () => {
		mobileMenuOpen = true;
		mobileMenu.classList.remove("hidden");
		hamburgerBtn.innerHTML = closeIconSvg;
	};

	const closeMobileMenu = () => {
		mobileMenuOpen = false;
		mobileMenu.classList.add("hidden");
		hamburgerBtn.innerHTML = menuIconSvg;
	};

	hamburgerBtn.addEventListener("click", () => {
		if (mobileMenuOpen) closeMobileMenu();
		else openMobileMenu();
	});

	mobileLinkEls.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			closeMobileMenu();
			navigate(link.getAttribute("href")!);
		});
	});

	return { hamburgerBtn, mobileMenu, mobileLinkEls };
}

interface NavView {
	nav: HTMLElement;
	navLinks: Array<HTMLAnchorElement>;
	mobileLinkEls: Array<HTMLAnchorElement>;
}

export function buildNavView(navigate: (path: string) => void): NavView {
	const navLinkEls = navLinks.map((link) =>
		el(
			"a",
			{ href: link.path, class: cn(desktopLinkBase, "text-muted-foreground") },
			link.label,
		),
	);

	navLinkEls.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			navigate(link.getAttribute("href")!);
		});
	});

	const { hamburgerBtn, mobileMenu, mobileLinkEls } =
		buildMobileNavView(navigate);

	const nav = el(
		"nav",
		{ class: "border-b border-border bg-background flex-0" },
		el(
			"div",
			{
				class: "container mx-auto flex h-14 items-center justify-between px-4",
			},
			el(
				"div",
				{ class: "flex items-center gap-6" },
				el("span", { class: "text-lg font-semibold text-foreground" }, "App"),
				...navLinkEls,
			),
			hamburgerBtn,
		),
		mobileMenu,
	);

	return { nav, navLinks: navLinkEls, mobileLinkEls };
}
