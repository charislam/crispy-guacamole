import { createRoute, redirect } from "@tanstack/react-router"

import { credentialsStore } from "@/lib/credentials/credentials-store.js"
import { HomePage } from "@/features/home/HomePage.js"
import { Route as RootRoute } from "./__root.js"

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  beforeLoad: () => {
    if (credentialsStore.getSnapshot().status === "unknown") {
      throw redirect({ to: "/credentials" })
    }
  },
  component: HomePage,
})
