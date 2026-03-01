import { Context, Effect, Layer } from "effect";

import { DatabaseService } from "./database.ts";

const failQuery = (_sql: string) => Effect.fail(new Error("Query failed"));

const mockQuery = (_sql: string) =>
	Effect.succeed([
		[
			{
				id: 1,
				value: "test",
			},
		],
	]);

export const databaseServiceFactory = (
	overrides: Partial<Context.Tag.Service<DatabaseService>>,
) =>
	Layer.succeed(DatabaseService, {
		query: mockQuery,
		...overrides,
	});

export const makeFailedDbQuery = () =>
	databaseServiceFactory({
		query: failQuery,
	});
