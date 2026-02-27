import { createRouter, type RouterHistory } from "@tanstack/react-router"
import { Effect } from "effect"

import { makeCredentialsStore } from "@/lib/credentials/store.js"
import { Route as RootRoute } from "./routes/__root.js"
import { Route as IndexRoute } from "./routes/index.js"
import { Route as CredentialsRoute } from "./routes/credentials.js"
import type { RouterContext } from "./routes/__root.js"

export type { RouterContext }

export const routeTree = RootRoute.addChildren([IndexRoute, CredentialsRoute])

export const createAppRouter = ({ context, history }: { context: RouterContext; history?: RouterHistory }) =>
  createRouter({ routeTree, context, history })

export const router = createAppRouter({
  context: { credentialsStore: Effect.runSync(makeCredentialsStore) },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
