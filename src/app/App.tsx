import { RouterProvider } from "@tanstack/react-router"

import { credentialsStore, CredentialsStoreContext } from "@/lib/credentials/credentials-store.js"
import { router } from "./router.js"

export default function App() {
  return (
    <CredentialsStoreContext.Provider value={credentialsStore}>
      <RouterProvider router={router} />
    </CredentialsStoreContext.Provider>
  )
}
