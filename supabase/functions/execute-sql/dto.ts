import { Effect, Schema } from "effect";

import { InvalidRequestError } from "./errors.ts";
import { Json } from "./request.ts";

const InputSchema = Schema.Struct({
	query: Schema.Trim.pipe(
		Schema.minLength(1, { message: () => "query must be a non-empty string" }),
	),
});

export const validateDto = (body: Json) =>
	Schema.decodeUnknown(InputSchema)(body).pipe(
		Effect.map(({ query }) => query),
		Effect.mapError((err) => new InvalidRequestError({ message: err.message })),
	);

