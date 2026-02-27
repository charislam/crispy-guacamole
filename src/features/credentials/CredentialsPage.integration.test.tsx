import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { makeStorageLayerNeverResolves } from "@/lib/storage/service.mock-layers.js";
import { renderApp } from "@/test/render-app.js";

const STORAGE_KEY = "credentials";

describe("CredentialsPage integration", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders the credentials form", async () => {
		await renderApp({ initialPath: "/credentials" });
		expect(screen.getByText("Connect to Supabase")).toBeInTheDocument();
		expect(screen.getByLabelText("Project URL")).toBeInTheDocument();
		expect(screen.getByLabelText("API Key")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Save credentials" }),
		).toBeInTheDocument();
	});

	it("navigates to the home page after submitting credentials", async () => {
		const user = userEvent.setup();
		await renderApp({
			initialPath: "/credentials",
			storageLayer: makeStorageLayerNeverResolves(),
		});

		await user.type(
			screen.getByLabelText("Project URL"),
			"https://test.supabase.co",
		);
		await user.type(screen.getByLabelText("API Key"), "test-key");
		await user.click(screen.getByRole("button", { name: "Save credentials" }));

		await waitFor(() =>
			expect(screen.getByText("Storage Buckets")).toBeInTheDocument(),
		);
	});

	it("can be visited when credentials are already set", async () => {
		await renderApp({
			initialPath: "/credentials",
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});
		expect(screen.getByText("Connect to Supabase")).toBeInTheDocument();
	});

	it("shows existing URL as placeholder", async () => {
		await renderApp({
			initialPath: "/credentials",
			initialCredentials: {
				url: "https://existing.supabase.co",
				key: "test-key",
			},
		});
		expect(screen.getByLabelText("Project URL")).toHaveAttribute(
			"placeholder",
			"https://existing.supabase.co",
		);
	});

	it("persists credentials to localStorage after submitting", async () => {
		const user = userEvent.setup();
		await renderApp({
			initialPath: "/credentials",
			storageLayer: makeStorageLayerNeverResolves(),
		});

		await user.type(
			screen.getByLabelText("Project URL"),
			"https://test.supabase.co",
		);
		await user.type(screen.getByLabelText("API Key"), "test-key");
		await user.click(screen.getByRole("button", { name: "Save credentials" }));

		await waitFor(() =>
			expect(screen.getByText("Storage Buckets")).toBeInTheDocument(),
		);
		expect(localStorage.getItem(STORAGE_KEY)).toBe(
			JSON.stringify({ url: "https://test.supabase.co", key: "test-key" }),
		);
	});

	it("loads home page directly when credentials are in localStorage", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ url: "https://test.supabase.co", key: "test-key" }),
		);
		await renderApp({
			initialPath: "/",
			storageLayer: makeStorageLayerNeverResolves(),
		});
		expect(screen.getByText("Storage Buckets")).toBeInTheDocument();
	});
});
