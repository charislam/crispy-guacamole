import { screen, waitFor } from "@testing-library/dom";
import { describe, expect, it } from "vitest";

import {
	makeStorageLayerNeverResolves,
	makeStorageLayerWithBuckets,
	makeStorageLayerWithError,
} from "@/lib/storage/service.mock-layers.js";
import { renderApp } from "@/test/render-app.js";

describe("HomePage integration", () => {
	it("redirects to /credentials when no credentials are set", async () => {
		await renderApp({ initialPath: "/" });
		expect(screen.getByText("Connect to Supabase")).toBeInTheDocument();
	});

	it("shows loading state initially", async () => {
		await renderApp({
			initialPath: "/",
			storageLayer: makeStorageLayerNeverResolves(),
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});
		const countEl = screen.getByText("—");
		expect(countEl).toBeInTheDocument();
	});

	it("shows bucket count when loaded", async () => {
		await renderApp({
			initialPath: "/",
			storageLayer: makeStorageLayerWithBuckets([
				{
					id: "bucket-1",
					name: "my-bucket",
					public: false,
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
					owner: "",
				},
				{
					id: "bucket-2",
					name: "other-bucket",
					public: false,
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
					owner: "",
				},
				{
					id: "bucket-3",
					name: "third-bucket",
					public: false,
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
					owner: "",
				},
			]),
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});
		await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
	});

	it("shows error state when service fails", async () => {
		await renderApp({
			initialPath: "/",
			storageLayer: makeStorageLayerWithError("Network error"),
			initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
		});
		await waitFor(() => expect(screen.getByText("Error")).toBeInTheDocument());
	});
});
