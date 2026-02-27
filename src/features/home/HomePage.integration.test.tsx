import { screen, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"

import { renderApp } from "@/test/render-app.js"
import {
  makeStorageLayerNeverResolves,
  makeStorageLayerWithBuckets,
  makeStorageLayerWithError,
} from "@/test/mock-layers.js"

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
})
