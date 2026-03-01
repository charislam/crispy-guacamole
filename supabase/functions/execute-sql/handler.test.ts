import { Effect, Layer } from "effect";
import { expect, it } from "vitest";

import { handlerWithErrorHandling } from "./handler.ts";
import { databaseServiceFactory, makeFailedDbQuery } from "./database.mocks.ts";
import {
	makeFailedSupabaseRequest,
	makeUnauthorizedSupabaseRequest,
	supabaseServiceFactory,
} from "./supabase.mocks.ts";
import {
	makeRequestWithInvalidJson,
	makeRequestWithValidQuery,
} from "./request.mocks.ts";

const makeTestLayer = ({
	supabase = supabaseServiceFactory({}),
	request = makeRequestWithValidQuery(),
	db = databaseServiceFactory({}),
} = {}) => Layer.mergeAll(supabase, request, db);

it("should return 401 when auth is unauthorized", async () => {
	const layer = makeTestLayer({ supabase: makeUnauthorizedSupabaseRequest() });
	const result = await Effect.runPromise(
		Effect.provide(handlerWithErrorHandling, layer),
	);
	expect(result.status).toBe(401);
	const body = await result.json();
	expect(body).toEqual({ error: "Unauthorized" });
});

it("should return 500 when supabase client errors", async () => {
	const layer = makeTestLayer({ supabase: makeFailedSupabaseRequest() });
	const result = await Effect.runPromise(
		Effect.provide(handlerWithErrorHandling, layer),
	);
	expect(result.status).toBe(500);
	const body = await result.json();
	expect(body).toEqual({ error: "Internal server error" });
});

it("should return 400 when request body is invalid JSON", async () => {
	const layer = makeTestLayer({ request: makeRequestWithInvalidJson() });
	const result = await Effect.runPromise(
		Effect.provide(handlerWithErrorHandling, layer),
	);
	expect(result.status).toBe(400);
});

it("should return 400 when database query fails", async () => {
	const layer = makeTestLayer({ db: makeFailedDbQuery() });
	const result = await Effect.runPromise(
		Effect.provide(handlerWithErrorHandling, layer),
	);
	expect(result.status).toBe(400);
	const body = await result.json();
	expect(body).toEqual({ error: "Database error" });
});

it("should return 200 with query results on success", async () => {
	const layer = makeTestLayer();
	const result = await Effect.runPromise(
		Effect.provide(handlerWithErrorHandling, layer),
	);
	expect(result.status).toBe(200);
	const body = await result.json();
	expect(body).toEqual([[{ id: 1, value: "test" }]]);
});
