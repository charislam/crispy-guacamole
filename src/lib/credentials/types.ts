export type SupabaseCredentials = { url: string; key: string }

type BaseCredentialsState = {
  status: "unknown" | "known"
  credentials: SupabaseCredentials | null
}

export type UnknownCredentialsState = BaseCredentialsState & {
  status: "unknown"
  credentials: null
}

export type KnownCredentialsState = BaseCredentialsState & {
  status: "known"
  credentials: SupabaseCredentials
}

export type CredentialsState = UnknownCredentialsState | KnownCredentialsState
