import { createRouter } from "@tanstack/react-router"

import { Route as RootRoute } from "./routes/__root.js"
import { Route as IndexRoute } from "./routes/index.js"
import { Route as CredentialsRoute } from "./routes/credentials.js"

const routeTree = RootRoute.addChildren([IndexRoute, CredentialsRoute])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
