import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Data, Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";

import { makeMemoryHistory } from "@/app/router.js";
import {
	makeStorageLayerNeverResolves,
	makeStorageLayerWithBuckets,
	makeStorageLayerWithFiles,
	makeStorageLayerWithFilesError,
} from "@/lib/storage/service.mock-layers.js";
import {
	StorageRequestError,
	SupabaseStorageService,
	type StorageItem,
} from "@/lib/storage/service.js";
import { renderApp } from "@/test/render-app.js";

const CREDENTIALS = {
	url: "https://test.supabase.co",
	key: "test-key",
} as const;

function makeFile(name: string): StorageItem {
	return Data.struct({
		name,
		id: `id-${name}`,
		updated_at: "2024-01-01T00:00:00Z",
		created_at: "2024-01-01T00:00:00Z",
		last_accessed_at: "2024-01-01T00:00:00Z",
		metadata: { size: 1024 },
	});
}

function makeFolder(name: string): StorageItem {
	return Data.struct({
		name,
		id: null,
		updated_at: null,
		created_at: null,
		last_accessed_at: null,
		metadata: null,
	});
}

describe("BucketPage integration", () => {
	it("redirects to /credentials when no credentials are set", async () => {
		await renderApp({ initialPath: "/storage/bucket/my-bucket" });
		expect(screen.getByText("Connect to Supabase")).toBeInTheDocument();
	});

	it("shows loading state initially", async () => {
		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer: makeStorageLayerNeverResolves(),
			initialCredentials: CREDENTIALS,
		});
		expect(screen.getByText("Loading files…")).toBeInTheDocument();
	});

	it("shows error state when service fails", async () => {
		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer: makeStorageLayerWithFilesError("Network error"),
			initialCredentials: CREDENTIALS,
		});
		await waitFor(() =>
			expect(
				screen.getByText(
					"Failed to load files. Check your credentials and try again.",
				),
			).toBeInTheDocument(),
		);
	});

	it("shows empty state when bucket has no files", async () => {
		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer: makeStorageLayerWithFiles([]),
			initialCredentials: CREDENTIALS,
		});
		await waitFor(() =>
			expect(screen.getByText("This bucket is empty.")).toBeInTheDocument(),
		);
	});

	it("displays the bucket ID as the page heading", async () => {
		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer: makeStorageLayerWithFiles([]),
			initialCredentials: CREDENTIALS,
		});
		expect(
			screen.getByRole("heading", { name: "my-bucket" }),
		).toBeInTheDocument();
	});

	it("shows files in the bucket", async () => {
		await renderApp({
			initialPath: "/storage/bucket/photos",
			storageLayer: makeStorageLayerWithFiles([
				makeFile("sunset.jpg"),
				makeFile("portrait.png"),
			]),
			initialCredentials: CREDENTIALS,
		});
		await waitFor(() =>
			expect(screen.getByText("sunset.jpg")).toBeInTheDocument(),
		);
		expect(screen.getByText("portrait.png")).toBeInTheDocument();
	});

	it("shows folders with a collapsed chevron", async () => {
		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer: makeStorageLayerWithFiles([makeFolder("images")]),
			initialCredentials: CREDENTIALS,
		});
		await waitFor(() =>
			expect(screen.getByText("images")).toBeInTheDocument(),
		);
		// Collapsed chevron is visible
		expect(document.querySelector('[data-state="collapsed"]')).toBeInTheDocument();
	});

	it("expanding a folder loads and shows its children", async () => {
		const user = userEvent.setup();
		const rootItems: StorageItem[] = [makeFolder("images")];
		const folderChildren: StorageItem[] = [makeFile("photo.jpg")];

		const storageLayer = Layer.succeed(SupabaseStorageService, {
			listBuckets: () => Effect.succeed([]),
			createBucket: () => Effect.void,
			deleteBucket: () => Effect.void,
			listFiles: (_bucketId, prefix) =>
				Effect.succeed(prefix === "" ? rootItems : folderChildren),
		});

		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer,
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("images")).toBeInTheDocument(),
		);

		await user.click(screen.getByText("images"));

		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);
		// Chevron changes to expanded state
		expect(document.querySelector('[data-state="expanded"]')).toBeInTheDocument();
	});

	it("collapsing an expanded folder hides its children", async () => {
		const user = userEvent.setup();
		const rootItems: StorageItem[] = [makeFolder("images")];
		const folderChildren: StorageItem[] = [makeFile("photo.jpg")];

		const storageLayer = Layer.succeed(SupabaseStorageService, {
			listBuckets: () => Effect.succeed([]),
			createBucket: () => Effect.void,
			deleteBucket: () => Effect.void,
			listFiles: (_bucketId, prefix) =>
				Effect.succeed(prefix === "" ? rootItems : folderChildren),
		});

		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer,
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("images")).toBeInTheDocument(),
		);

		// Expand
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);

		// Collapse
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.queryByText("photo.jpg")).not.toBeInTheDocument(),
		);
		// Chevron returns to collapsed state
		expect(document.querySelector('[data-state="collapsed"]')).toBeInTheDocument();
	});

	it("listFiles is called with the correct bucket ID and folder prefix", async () => {
		const user = userEvent.setup();
		const listFilesSpy = vi.fn((_bucketId: string, prefix: string) =>
			Effect.succeed(
				prefix === "" ? [makeFolder("assets")] : [makeFile("logo.svg")],
			),
		);

		const storageLayer = Layer.succeed(SupabaseStorageService, {
			listBuckets: () => Effect.succeed([]),
			createBucket: () => Effect.void,
			deleteBucket: () => Effect.void,
			listFiles: listFilesSpy,
		});

		await renderApp({
			initialPath: "/storage/bucket/site-assets",
			storageLayer,
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("assets")).toBeInTheDocument(),
		);
		expect(listFilesSpy).toHaveBeenCalledWith("site-assets", "");

		await user.click(screen.getByText("assets"));

		await waitFor(() =>
			expect(screen.getByText("logo.svg")).toBeInTheDocument(),
		);
		expect(listFilesSpy).toHaveBeenCalledWith("site-assets", "assets");
	});

	it("does not re-fetch folder contents when re-expanding a previously expanded folder", async () => {
		const user = userEvent.setup();
		const listFilesSpy = vi.fn((_bucketId: string, prefix: string) =>
			Effect.succeed(
				prefix === "" ? [makeFolder("images")] : [makeFile("photo.jpg")],
			),
		);

		const storageLayer = Layer.succeed(SupabaseStorageService, {
			listBuckets: () => Effect.succeed([]),
			createBucket: () => Effect.void,
			deleteBucket: () => Effect.void,
			listFiles: listFilesSpy,
		});

		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer,
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("images")).toBeInTheDocument(),
		);

		// Expand
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);

		// Collapse
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.queryByText("photo.jpg")).not.toBeInTheDocument(),
		);

		const callCountAfterFirstExpand = listFilesSpy.mock.calls.length;

		// Re-expand
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);

		// listFiles should not have been called again for the folder
		expect(listFilesSpy.mock.calls.length).toBe(callCountAfterFirstExpand);
	});

	it("shows cached children immediately when re-expanding a folder", async () => {
		const user = userEvent.setup();
		const rootItems: StorageItem[] = [makeFolder("images")];
		const folderChildren: StorageItem[] = [makeFile("photo.jpg")];

		const storageLayer = Layer.succeed(SupabaseStorageService, {
			listBuckets: () => Effect.succeed([]),
			createBucket: () => Effect.void,
			deleteBucket: () => Effect.void,
			listFiles: (_bucketId, prefix) =>
				Effect.succeed(prefix === "" ? rootItems : folderChildren),
		});

		await renderApp({
			initialPath: "/storage/bucket/my-bucket",
			storageLayer,
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("images")).toBeInTheDocument(),
		);

		// Expand → collapse → re-expand
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);
		await user.click(screen.getByText("images"));
		await waitFor(() =>
			expect(screen.queryByText("photo.jpg")).not.toBeInTheDocument(),
		);
		await user.click(screen.getByText("images"));

		// Children should reappear and chevron should be expanded
		await waitFor(() =>
			expect(screen.getByText("photo.jpg")).toBeInTheDocument(),
		);
		expect(document.querySelector('[data-state="expanded"]')).toBeInTheDocument();
	});

	it("navigates to bucket page when clicking a bucket name on /storage", async () => {
		const user = userEvent.setup();

		await renderApp({
			initialPath: "/storage",
			storageLayer: makeStorageLayerWithBuckets([
				{
					id: "bucket-1",
					name: "my-bucket",
					public: false,
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
					owner: "",
				},
			]),
			initialCredentials: CREDENTIALS,
		});

		await waitFor(() =>
			expect(screen.getByText("my-bucket")).toBeInTheDocument(),
		);

		await user.click(screen.getByRole("link", { name: "my-bucket" }));

		await waitFor(() =>
			expect(
				screen.getByRole("heading", { name: "bucket-1" }),
			).toBeInTheDocument(),
		);
	});
});
