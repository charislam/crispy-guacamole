import { createContext } from "react"
import { Effect } from "effect"

import { makeCredentialsStore } from "@/lib/credentials/store.js"

export const credentialsStore = Effect.runSync(makeCredentialsStore)

export const CredentialsStoreContext = createContext(credentialsStore)
