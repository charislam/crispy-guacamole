import { createRoute } from "@tanstack/react-router"

import { CredentialsPage } from "@/features/credentials/CredentialsPage.js"
import { Route as RootRoute } from "./__root.js"

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/credentials",
  component: CredentialsPage,
})
