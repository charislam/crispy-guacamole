import { createRoute, redirect } from "@tanstack/react-router"

import { HomePage } from "@/features/home/HomePage.js"
import { Route as RootRoute } from "./__root.js"

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    if (context.credentialsStore.getSnapshot().status === "unknown") {
      throw redirect({ to: "/credentials" })
    }
  },
  component: HomePage,
})
