import { Cause, Chunk, Effect } from "effect";

import { DatabaseService } from "./database.ts";
import { validateDto } from "./dto.ts";
import {
	DatabaseError,
	InternalServerError,
	InvalidRequestError,
	SupabaseClientError,
	UnauthorizedError,
} from "./errors.ts";
import {
	RequestService,
} from "./request.ts";
import { SupabaseClientService } from "./supabase.ts";

const checkAuth = Effect.gen(function* () {
	const supabase = yield* SupabaseClientService;
	return yield* supabase.adminListUsers().pipe(
		Effect.matchEffect({
			onSuccess: () => Effect.succeed(undefined),
			onFailure: (error): Effect.Effect<never, InternalServerError | UnauthorizedError> => {
				if (error instanceof SupabaseClientError) {
					return Effect.fail(new InternalServerError({ cause: error }));
				}
				return Effect.fail(new UnauthorizedError());
			},
		}),
	);
});

const runQuery = Effect.gen(function* () {
	const requestService = yield* RequestService;
	const db = yield* DatabaseService;

	const body = yield* requestService
		.getJsonBody()
		.pipe(
			Effect.mapError(
				() => new InvalidRequestError({ message: "Invalid request body" }),
			),
		);
	const query = yield* validateDto(body);
	const result = yield* db
		.query(query)
		.pipe(Effect.mapError((err) => new DatabaseError({ cause: err })));
	return result;
});

const jsonResponse = (body: unknown, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

const handler = Effect.andThen(checkAuth, runQuery);
export const handlerWithErrorHandling = handler.pipe(
	Effect.map((rows) => jsonResponse(rows, 200)),
	Effect.tapErrorCause((cause) => {
		const failures = Cause.failures(cause);
		const messages = Chunk.map(failures, (error) => error._tag).pipe(Chunk.join(", "));
		const causes = Chunk.filter(failures, (e) => "cause" in e).pipe(
			Chunk.map((e) => (e as { cause: unknown }).cause),
			Chunk.toArray,
		);
		return causes.length > 0
			? Effect.logError(messages).pipe(Effect.annotateLogs("cause", causes))
			: Effect.logError(messages);
	}),
	Effect.catchTags({
		UnauthorizedError: () =>
			Effect.succeed(jsonResponse({ error: "Unauthorized" }, 401)),
		InvalidRequestError: ({ message }) =>
			Effect.succeed(jsonResponse({ error: message }, 400)),
		DatabaseError: () =>
			Effect.succeed(jsonResponse({ error: "Database error" }, 400)),
		InternalServerError: () =>
			Effect.succeed(jsonResponse({ error: "Internal server error" }, 500)),
	}),
	Effect.catchAllCause(() =>
		Effect.succeed(jsonResponse({ error: "Internal server error" }, 500)),
	),
);

