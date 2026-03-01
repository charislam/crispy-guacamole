import { Data } from "effect";

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<
	Record<never, never>
> {}

export class InvalidRequestError extends Data.TaggedError(
	"InvalidRequestError",
)<{ message: string }> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	cause: unknown;
}> {}

export class InternalServerError extends Data.TaggedError(
	"InternalServerError",
)<{ cause?: unknown }> {}

export class SupabaseClientError extends Data.TaggedError("SupabaseClientError")<{
	cause: unknown;
}> {}
