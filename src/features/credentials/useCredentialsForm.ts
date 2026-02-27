import { useNavigate } from "@tanstack/react-router"
import { Effect } from "effect"
import { useContext } from "react"

import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js"

export function useCredentialsForm() {
  const store = useContext(CredentialsStoreContext)
  const navigate = useNavigate()

  const onSubmit = (url: string, key: string) => {
    Effect.runSync(store.setCredentials(url, key))
    navigate({ to: "/" })
  }

  return { onSubmit }
}
