import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
    makeStatefulStorageLayer,
    makeStorageLayerNeverResolves,
    makeStorageLayerWithBuckets,
    makeStorageLayerWithError,
} from "@/lib/storage/service.mock-layers.js"
import { renderApp } from "@/test/render-app.js"

describe("HomePage integration", () => {
  it("redirects to /credentials when no credentials are set", async () => {
    await renderApp({ initialPath: "/" })
    expect(screen.getByText("Connect to Supabase")).toBeInTheDocument()
  })

  it("shows bucket list from mock service", async () => {
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
      ]),
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })
    await waitFor(() => expect(screen.getByText("my-bucket")).toBeInTheDocument())
  })

  it("shows error state when service fails", async () => {
    await renderApp({
      initialPath: "/",
      storageLayer: makeStorageLayerWithError("Network error"),
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })
    await waitFor(() =>
      expect(screen.getByText("Failed to load buckets. Check your credentials and try again.")).toBeInTheDocument()
    )
  })

  it("shows loading state initially", async () => {
    await renderApp({
      initialPath: "/",
      storageLayer: makeStorageLayerNeverResolves(),
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })
    expect(screen.getByText("Loading buckets...")).toBeInTheDocument()
  })

  it("delete button is present for each bucket", async () => {
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
      ]),
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })
    await waitFor(() => expect(screen.getByText("my-bucket")).toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  })

  it("clicking delete and confirming calls deleteBucket and removes bucket from list", async () => {
    const user = userEvent.setup()
    const { layer, deleteBucketSpy } = makeStatefulStorageLayer([
      {
        id: "bucket-1",
        name: "my-bucket",
        public: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        owner: "",
      },
    ])

    await renderApp({
      initialPath: "/",
      storageLayer: layer,
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })

    await waitFor(() => expect(screen.getByText("my-bucket")).toBeInTheDocument())

    // Open the confirmation dialog
    await user.click(screen.getByRole("button", { name: "Delete" }))

    // Confirm deletion — after dialog opens, the trigger is aria-hidden so only the action button is accessible
    await user.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => expect(deleteBucketSpy).toHaveBeenCalledOnce())
    expect(deleteBucketSpy).toHaveBeenCalledWith("bucket-1")

    await waitFor(() => expect(screen.queryByText("my-bucket")).not.toBeInTheDocument())
  })

  it("clicking delete then cancel does not call deleteBucket", async () => {
    const user = userEvent.setup()
    const { layer, deleteBucketSpy } = makeStatefulStorageLayer([
      {
        id: "bucket-1",
        name: "my-bucket",
        public: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        owner: "",
      },
    ])

    await renderApp({
      initialPath: "/",
      storageLayer: layer,
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })

    await waitFor(() => expect(screen.getByText("my-bucket")).toBeInTheDocument())

    // Open the confirmation dialog
    await user.click(screen.getByRole("button", { name: "Delete" }))

    // Cancel
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(deleteBucketSpy).not.toHaveBeenCalled()
    expect(screen.queryByText("my-bucket")).toBeInTheDocument()
  })

  it("creates a bucket, spies on the request, and shows it after refresh", async () => {
    const user = userEvent.setup()
    const { layer, createBucketSpy } = makeStatefulStorageLayer([
      {
        id: "existing",
        name: "existing-bucket",
        public: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        owner: "",
      },
    ])

    await renderApp({
      initialPath: "/",
      storageLayer: layer,
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })

    // Initial list
    await waitFor(() => expect(screen.getByText("existing-bucket")).toBeInTheDocument())

    // Open form, fill in name, submit
    await user.click(screen.getByRole("button", { name: "Add bucket" }))
    await user.type(screen.getByLabelText("Bucket name"), "new-bucket")
    await user.click(screen.getByRole("button", { name: "Create" }))

    // Spy confirms the service was called correctly
    await waitFor(() => expect(createBucketSpy).toHaveBeenCalledOnce())
    expect(createBucketSpy).toHaveBeenCalledWith("new-bucket")

    // New bucket appears (proves the refresh happened and state was updated)
    await waitFor(() => expect(screen.getAllByText("new-bucket").length).toBeGreaterThan(0))

    // Original bucket still present (list was refreshed, not replaced)
    expect(screen.getAllByText("existing-bucket").length).toBeGreaterThan(0)

    // Form was hidden after success
    expect(screen.queryByLabelText("Bucket name")).not.toBeInTheDocument()
  })
})
