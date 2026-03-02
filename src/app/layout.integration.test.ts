import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderApp } from "@/test/render-app.js";

// Desktop links are always first in the DOM; mobile duplicates come second.
function getDesktopLink(name: string) {
	return screen.getAllByRole("link", { name })[0];
}

describe("AppLayout integration", () => {
	it("highlights the Home link when the initial route is /", async () => {
		await renderApp({
			initialPath: "/",
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});

		const homeLink = getDesktopLink("Home");
		const storageLink = getDesktopLink("Storage");

		await waitFor(() => {
			expect(homeLink).toHaveClass("text-foreground");
			expect(homeLink).not.toHaveClass("text-muted-foreground");
		});
		expect(storageLink).toHaveClass("text-muted-foreground");
		expect(storageLink).not.toHaveClass("text-foreground");
	});

	it("highlights the Storage link when the initial route is /storage", async () => {
		await renderApp({
			initialPath: "/storage",
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});

		const homeLink = getDesktopLink("Home");
		const storageLink = getDesktopLink("Storage");

		await waitFor(() => {
			expect(storageLink).toHaveClass("text-foreground");
			expect(storageLink).not.toHaveClass("text-muted-foreground");
		});
		expect(homeLink).toHaveClass("text-muted-foreground");
		expect(homeLink).not.toHaveClass("text-foreground");
	});

	it("updates the active link highlight when a nav link is clicked", async () => {
		const user = userEvent.setup();
		await renderApp({
			initialPath: "/",
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});

		const homeLink = getDesktopLink("Home");
		const storageLink = getDesktopLink("Storage");

		await waitFor(() => expect(homeLink).toHaveClass("text-foreground"));

		await user.click(storageLink);

		await waitFor(() => {
			expect(storageLink).toHaveClass("text-foreground");
			expect(storageLink).not.toHaveClass("text-muted-foreground");
		});
		expect(homeLink).toHaveClass("text-muted-foreground");
		expect(homeLink).not.toHaveClass("text-foreground");
	});

	it("marks no nav link as active when redirected to a route outside the nav", async () => {
		await renderApp({ initialPath: "/" });

		const homeLink = getDesktopLink("Home");
		const storageLink = getDesktopLink("Storage");

		await waitFor(() => {
			expect(homeLink).toHaveClass("text-muted-foreground");
			expect(storageLink).toHaveClass("text-muted-foreground");
		});
		expect(homeLink).not.toHaveClass("text-foreground");
		expect(storageLink).not.toHaveClass("text-foreground");
	});
});

describe("AppLayout mobile navigation", () => {
	const credentials = {
		initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
	};

	function getMobileMenu() {
		return screen.getByTestId("mobile-menu");
	}

	function getMobileLink(name: string) {
		return screen.getAllByRole("link", { name })[1];
	}

	it("renders a hamburger button", async () => {
		await renderApp({ initialPath: "/", ...credentials });
		expect(
			screen.getByRole("button", { name: "Toggle menu" }),
		).toBeInTheDocument();
	});

	it("mobile menu is initially closed", async () => {
		await renderApp({ initialPath: "/", ...credentials });
		expect(getMobileMenu()).toHaveClass("hidden");
	});

	it("opens mobile menu when hamburger is clicked", async () => {
		const user = userEvent.setup();
		await renderApp({ initialPath: "/", ...credentials });

		await user.click(screen.getByRole("button", { name: "Toggle menu" }));

		expect(getMobileMenu()).not.toHaveClass("hidden");
	});

	it("closes mobile menu after a mobile link is clicked", async () => {
		const user = userEvent.setup();
		await renderApp({ initialPath: "/", ...credentials });

		await user.click(screen.getByRole("button", { name: "Toggle menu" }));
		await user.click(getMobileLink("Storage"));

		await waitFor(() => expect(getMobileMenu()).toHaveClass("hidden"));
	});

	it("applies active styles to the current route's mobile link", async () => {
		const user = userEvent.setup();
		await renderApp({ initialPath: "/storage", ...credentials });

		await user.click(screen.getByRole("button", { name: "Toggle menu" }));

		await waitFor(() => {
			expect(getMobileLink("Storage")).toHaveClass("bg-accent");
			expect(getMobileLink("Home")).not.toHaveClass("bg-accent");
		});
	});

	it("navigates to the correct route when a mobile link is clicked", async () => {
		const user = userEvent.setup();
		await renderApp({ initialPath: "/", ...credentials });

		await user.click(screen.getByRole("button", { name: "Toggle menu" }));
		await user.click(getMobileLink("Storage"));

		await waitFor(() => {
			expect(getMobileLink("Storage")).toHaveClass("bg-accent");
			expect(getMobileLink("Home")).not.toHaveClass("bg-accent");
		});
	});
});
