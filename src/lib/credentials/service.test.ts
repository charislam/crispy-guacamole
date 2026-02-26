import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import { SupabaseCredentialsService, SupabaseCredentialsServiceLive } from "./service"

describe("SupabaseCredentialsServiceLive", () => {
  it.effect("provides the given credentials", () =>
    Effect.gen(function* () {
      const credentials = yield* SupabaseCredentialsService
      expect(credentials).toEqual({ url: "https://example.supabase.co", key: "secret-key" })
    }).pipe(
      Effect.provide(
        SupabaseCredentialsServiceLive({ url: "https://example.supabase.co", key: "secret-key" })
      )
    )
  )

  it.effect("provides the url field", () =>
    Effect.gen(function* () {
      const { url } = yield* SupabaseCredentialsService
      expect(url).toBe("https://my-project.supabase.co")
    }).pipe(
      Effect.provide(
        SupabaseCredentialsServiceLive({ url: "https://my-project.supabase.co", key: "any-key" })
      )
    )
  )

  it.effect("provides the key field", () =>
    Effect.gen(function* () {
      const { key } = yield* SupabaseCredentialsService
      expect(key).toBe("my-secret-key")
    }).pipe(
      Effect.provide(
        SupabaseCredentialsServiceLive({ url: "https://example.supabase.co", key: "my-secret-key" })
      )
    )
  )

  it.effect("different layer instances provide different credentials", () =>
    Effect.gen(function* () {
      const credA = yield* Effect.provide(
        SupabaseCredentialsService,
        SupabaseCredentialsServiceLive({ url: "https://a.supabase.co", key: "key-a" })
      )
      const credB = yield* Effect.provide(
        SupabaseCredentialsService,
        SupabaseCredentialsServiceLive({ url: "https://b.supabase.co", key: "key-b" })
      )
      expect(credA.url).toBe("https://a.supabase.co")
      expect(credB.url).toBe("https://b.supabase.co")
    })
  )

  it.effect("layer can be composed with Layer.provide", () =>
    Effect.gen(function* () {
      const inner = Layer.succeed(SupabaseCredentialsService, {
        url: "https://composed.supabase.co",
        key: "composed-key",
      })
      const credentials = yield* Effect.provide(SupabaseCredentialsService, inner)
      expect(credentials).toEqual({ url: "https://composed.supabase.co", key: "composed-key" })
    })
  )
})
