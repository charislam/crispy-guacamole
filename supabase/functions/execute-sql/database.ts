import { Config, Context, Effect, Layer } from "effect";
import postgres, { type Row } from "postgres";

export class DatabaseService extends Context.Tag("DatabaseService")<
	DatabaseService,
	{
		query: (sql: string) => Effect.Effect<Array<Row & Iterable<Row>>, Error>;
	}
>() {}

export const DatabaseServiceLive = Layer.effect(
	DatabaseService,
	Effect.gen(function* () {
		const dbUrl = yield* Config.string("SUPABASE_DB_URL");
		const sql = postgres(dbUrl);
		return {
			query: (query: string) =>
				Effect.tryPromise({
					try: () => sql.unsafe(query).execute(),
					catch: (err) => new Error(String(err)),
				}),
		};
	}),
);
