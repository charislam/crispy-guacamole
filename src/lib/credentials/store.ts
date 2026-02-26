import { Effect } from "effect"

import { makeStore } from "../resource/store.js"
import type { CredentialsState } from "./types.js"

export const makeCredentialsStore = Effect.gen(function* () {
  const store = yield* makeStore<CredentialsState>({ status: "unknown", credentials: null })

  const setCredentials = (url: string, key: string) =>
    store.update(() => ({ status: "known", credentials: { url, key } }))

  const clearCredentials = () =>
    store.update(() => ({ status: "unknown", credentials: null }))

  return { ...store, setCredentials, clearCredentials }
})
