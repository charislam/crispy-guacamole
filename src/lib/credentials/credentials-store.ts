import { Effect } from "effect";

import { makeCredentialsStore } from "@/lib/credentials/store.js";

export const credentialsStore = Effect.runSync(makeCredentialsStore);
