import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderApp } from "@/test/render-app.js";

describe("AppLayout integration", () => {
	it("highlights the Home link when the initial route is /", async () => {
		await renderApp({
			initialPath: "/",
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});

		const homeLink = screen.getByRole("link", { name: "Home" });
		const storageLink = screen.getByRole("link", { name: "Storage" });

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

		const homeLink = screen.getByRole("link", { name: "Home" });
		const storageLink = screen.getByRole("link", { name: "Storage" });

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

		const homeLink = screen.getByRole("link", { name: "Home" });
		const storageLink = screen.getByRole("link", { name: "Storage" });

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

		const homeLink = screen.getByRole("link", { name: "Home" });
		const storageLink = screen.getByRole("link", { name: "Storage" });

		await waitFor(() => {
			expect(homeLink).toHaveClass("text-muted-foreground");
			expect(storageLink).toHaveClass("text-muted-foreground");
		});
		expect(homeLink).not.toHaveClass("text-foreground");
		expect(storageLink).not.toHaveClass("text-foreground");
	});
});
