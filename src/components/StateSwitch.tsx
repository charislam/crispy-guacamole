import type React from "react"

type StateMatch<T extends { status: string }> = {
  [K in T["status"]]: (state: Extract<T, { status: K }>) => React.ReactNode
}

export function StateSwitch<T extends { status: string }>({
  state,
  cases,
}: {
  state: T
  cases: StateMatch<T>
}) {
  const render = cases[state.status as T["status"]] as (state: T) => React.ReactNode
  return <>{render(state)}</>
}
