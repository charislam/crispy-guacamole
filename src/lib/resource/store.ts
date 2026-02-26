import { Effect, MutableRef } from "effect"

export const makeStore = <A>(initial: A) =>
  Effect.gen(function* () {
    const state = MutableRef.make(initial)
    const listeners = new Set<() => void>()

    const getSnapshot = () => MutableRef.get(state)

    const subscribe = (cb: () => void) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    }

    const update = (f: (a: A) => A) =>
	Effect.sync(() => {
	  const prev = MutableRef.get(state)
	  const next = f(prev)

	  if (Object.is(prev, next)) return

	  MutableRef.set(state, next)
	  queueMicrotask(() => listeners.forEach(l => l()))
	})

    return {
      getSnapshot,
      subscribe,
      update
    }
  })
