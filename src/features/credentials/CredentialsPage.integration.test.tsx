import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"

import { renderApp } from "@/test/render-app.js"
import { makeStorageLayerNeverResolves } from "@/test/mock-layers.js"

describe("CredentialsPage integration", () => {
  it("renders the credentials form", async () => {
    await renderApp({ initialPath: "/credentials" })
    expect(screen.getByText("Connect to Supabase")).toBeInTheDocument()
    expect(screen.getByLabelText("Project URL")).toBeInTheDocument()
    expect(screen.getByLabelText("API Key")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save credentials" })).toBeInTheDocument()
  })

  it("navigates to the home page after submitting credentials", async () => {
    const user = userEvent.setup()
    await renderApp({
      initialPath: "/credentials",
      storageLayer: makeStorageLayerNeverResolves(),
    })

    await user.type(screen.getByLabelText("Project URL"), "https://test.supabase.co")
    await user.type(screen.getByLabelText("API Key"), "test-key")
    await user.click(screen.getByRole("button", { name: "Save credentials" }))

    await waitFor(() => expect(screen.getByText("Storage Buckets")).toBeInTheDocument())
  })

  it("can be visited when credentials are already set", async () => {
    await renderApp({
      initialPath: "/credentials",
      initialCredentials: { url: "https://test.supabase.co", key: "test-key" },
    })
    expect(screen.getByText("Connect to Supabase")).toBeInTheDocument()
  })
})
