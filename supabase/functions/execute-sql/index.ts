import { Effect, Layer } from "effect";

import { ConfigLayer } from "./config.ts";
import { DatabaseServiceLive } from "./database.ts";
import { handlerWithErrorHandling } from "./handler.ts";
import { RawRequestService, RequestServiceLive } from "./request.ts";
import { SupabaseClientLive } from "./supabase.ts";

Deno.serve((req) => {
	const RawRequestServiceLive = Layer.succeed(RawRequestService, req);
	const RequestLayer = Layer.provide(RequestServiceLive, RawRequestServiceLive);
	const DatabaseLayer = DatabaseServiceLive.pipe(Layer.provide(ConfigLayer));
	const AppLayer = Layer.mergeAll(
		SupabaseClientLive.pipe(
			Layer.provide(Layer.merge(ConfigLayer, RequestLayer)),
		),
		DatabaseLayer,
		RequestLayer,
	);

	return Effect.runPromise(Effect.provide(handlerWithErrorHandling, AppLayer));
});
