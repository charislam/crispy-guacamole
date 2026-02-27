import { createRoute, useNavigate } from "@tanstack/react-router"
import { Effect } from "effect"
import { useContext, useState } from "react"

import { Button } from "@/components/ui/button.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js"
import { Input } from "@/components/ui/input.js"
import { Label } from "@/components/ui/label.js"
import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js"
import { Route as RootRoute } from "./__root.js"

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/credentials",
  component: CredentialsPage,
})

function CredentialsPage() {
  const store = useContext(CredentialsStoreContext)
  const navigate = useNavigate()
  const [url, setUrl] = useState("")
  const [key, setKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    Effect.runSync(store.setCredentials(url, key))
    navigate({ to: "/" })
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to Supabase</CardTitle>
          <CardDescription>Enter your Supabase project URL and API key to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Project URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">API Key</Label>
              <Input
                id="key"
                type="password"
                placeholder="your-anon-or-service-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save credentials
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
