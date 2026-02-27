import { useSyncExternalStore } from "react"

import type { CredentialsState } from "../credentials/types.js"

type CredentialsStore = {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => CredentialsState
}

export const useCredentials = (store: CredentialsStore) =>
  useSyncExternalStore(store.subscribe, store.getSnapshot)
