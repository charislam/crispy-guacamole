import { Context, Layer } from "effect"

import type { SupabaseCredentials } from "./types.js"

export class SupabaseCredentialsService extends Context.Tag("SupabaseCredentialsService")<
  SupabaseCredentialsService,
  SupabaseCredentials
>() {}

export const SupabaseCredentialsServiceLive = (credentials: SupabaseCredentials) =>
  Layer.succeed(SupabaseCredentialsService, credentials)
