import { RouterProvider } from "@tanstack/react-router"

import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js"
import { router } from "./router.js"

export default function App() {
  return (
    <CredentialsStoreContext.Provider value={router.options.context.credentialsStore}>
      <RouterProvider router={router} />
    </CredentialsStoreContext.Provider>
  )
}
