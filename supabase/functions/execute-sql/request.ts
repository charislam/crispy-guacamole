import { Context, Effect, Layer, Redacted } from "effect";
import { UnauthorizedError } from "./errors.ts";

export type Json =
	| Record<string, unknown>
	| Array<unknown>
	| string
	| number
	| boolean
	| null;

export class RawRequestService extends Context.Tag("RawRequestService")<
	RawRequestService,
	Request
>() {}

export class RequestService extends Context.Tag("RequestService")<
	RequestService,
	{
		getUncheckedAuth: () => Effect.Effect<
			Redacted.Redacted<string>,
			UnauthorizedError
		>;
		getJsonBody: () => Effect.Effect<Json, Error>;
	}
>() {}

export const RequestServiceLive = Layer.effect(
	RequestService,
	Effect.gen(function* () {
		const req = yield* RawRequestService;

		const getUncheckedAuth = () => {
			const authHeader = req.headers.get("Authorization");
			if (!authHeader?.startsWith("Bearer ")) {
				return Effect.fail(new UnauthorizedError());
			}
			const token = authHeader.slice("Bearer ".length);
			if (!token) {
				return Effect.fail(new UnauthorizedError());
			}
			return Effect.succeed(Redacted.make(token));
		};

		const getJsonBody = () =>
			Effect.tryPromise({
				try: () => req.json() as Promise<Json>,
				catch: (err) => new Error(`Invalid JSON body: ${String(err)}`),
			});

		return {
			getUncheckedAuth,
			getJsonBody,
		};
	}),
);
