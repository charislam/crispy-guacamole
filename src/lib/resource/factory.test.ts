import { describe, expect, it } from "@effect/vitest"
import { Deferred, Effect, Fiber } from "effect"

import { makeResource } from "./factory"

describe("makeResource", () => {
  it.effect("initializes with idle state", () =>
    Effect.gen(function* () {
      const resource = yield* makeResource((_: void) => Effect.succeed("data"))
      expect(resource.store.getSnapshot()).toEqual({
        status: "idle",
        data: null,
        error: null,
      })
    })
  )

  it.effect("transitions to ready state on successful run", () =>
    Effect.gen(function* () {
      const resource = yield* makeResource((_: void) => Effect.succeed(42))
      yield* resource.run(undefined)
      expect(resource.store.getSnapshot()).toEqual({
        status: "ready",
        data: 42,
        error: null,
      })
    })
  )

  it.effect("passes input to the load function", () =>
    Effect.gen(function* () {
      const resource = yield* makeResource((n: number) => Effect.succeed(n * 2))
      yield* resource.run(21)
      expect(resource.store.getSnapshot()).toEqual({
        status: "ready",
        data: 42,
        error: null,
      })
    })
  )

  it.effect("transitions to error state on failed run", () =>
    Effect.gen(function* () {
      const resource = yield* makeResource((_: void) => Effect.fail("oops"))
      yield* resource.run(undefined)
      expect(resource.store.getSnapshot()).toEqual({
        status: "error",
        data: null,
        error: "oops",
      })
    })
  )

  it.effect("transitions through pending state while run is in-flight", () =>
    Effect.gen(function* () {
      const deferred = yield* Deferred.make<string>()
      const resource = yield* makeResource((_: void) => Deferred.await(deferred))

      const fiber = yield* Effect.fork(resource.run(undefined))
      yield* Effect.yieldNow()

      expect(resource.store.getSnapshot().status).toBe("pending")

      yield* Deferred.succeed(deferred, "resolved")
      yield* Fiber.join(fiber)

      expect(resource.store.getSnapshot()).toEqual({
        status: "ready",
        data: "resolved",
        error: null,
      })
    })
  )

  it.effect("recovers to ready state after a previous error", () =>
    Effect.gen(function* () {
      let shouldFail = true
      const resource = yield* makeResource((_: void) =>
        shouldFail ? Effect.fail("boom") : Effect.succeed("ok")
      )

      yield* resource.run(undefined)
      expect(resource.store.getSnapshot().status).toBe("error")

      shouldFail = false
      yield* resource.run(undefined)
      expect(resource.store.getSnapshot()).toEqual({
        status: "ready",
        data: "ok",
        error: null,
      })
    })
  )
})
