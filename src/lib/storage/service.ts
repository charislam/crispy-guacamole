import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Context, Data, Effect, Layer, Schema } from "effect";

import { SupabaseCredentialsService } from "../credentials/service.js";

type ListBucketsOptions = Pick<
	NonNullable<Parameters<SupabaseClient["storage"]["listBuckets"]>[0]>,
	"limit" | "offset"
>;

export const BucketSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	owner: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String,
	public: Schema.Boolean,
	file_size_limit: Schema.optional(Schema.NullOr(Schema.Number)),
	allowed_mime_types: Schema.optional(
		Schema.NullOr(Schema.Array(Schema.String)),
	),
});

export type Bucket = Schema.Schema.Type<typeof BucketSchema>;

export class StorageRequestError extends Data.TaggedError(
	"StorageRequestError",
)<{
	cause: unknown;
}> {}

export class StorageSchemaError extends Data.TaggedError("StorageSchemaError")<{
	cause: unknown;
}> {}

export class SupabaseStorageService extends Context.Tag(
	"SupabaseStorageService",
)<
	SupabaseStorageService,
	{
		listBuckets: (
			options?: ListBucketsOptions,
		) => Effect.Effect<Bucket[], StorageRequestError | StorageSchemaError>;
		createBucket: (name: string) => Effect.Effect<void, StorageRequestError>;
		deleteBucket: (id: string) => Effect.Effect<void, StorageRequestError>;
	}
>() {}

const createBucket = (client: SupabaseClient, name: string) =>
	Effect.tryPromise({
		try: () => client.storage.createBucket(name),
		catch: (cause) => new StorageRequestError({ cause }),
	}).pipe(
		Effect.flatMap(({ error }) =>
			error !== null
				? Effect.fail(new StorageRequestError({ cause: error }))
				: Effect.void,
		),
	);

const deleteBucket = (client: SupabaseClient, id: string) =>
	Effect.tryPromise({
		try: () => client.storage.deleteBucket(id),
		catch: (cause) => new StorageRequestError({ cause }),
	}).pipe(
		Effect.flatMap(({ error }) =>
			error !== null
				? Effect.fail(new StorageRequestError({ cause: error }))
				: Effect.void,
		),
	);

const listBuckets = (client: SupabaseClient, options?: ListBucketsOptions) =>
	Effect.tryPromise({
		try: () => client.storage.listBuckets(options),
		catch: (cause) => new StorageRequestError({ cause }),
	}).pipe(
		Effect.flatMap(({ data, error }) =>
			error !== null
				? Effect.fail(new StorageRequestError({ cause: error }))
				: Effect.succeed(data ?? []),
		),
		Effect.flatMap((data) =>
			Schema.decodeUnknown(Schema.Array(BucketSchema))(data).pipe(
				Effect.mapError((cause) => new StorageSchemaError({ cause })),
			),
		),
	);

export const SupabaseStorageServiceLive = Layer.effect(
	SupabaseStorageService,
	Effect.gen(function* () {
		const { url, key } = yield* SupabaseCredentialsService;
		const client = createClient(url, key);
		return {
			listBuckets: (options) => listBuckets(client, options),
			createBucket: (name) => createBucket(client, name),
			deleteBucket: (id) => deleteBucket(client, id),
		};
	}),
);
