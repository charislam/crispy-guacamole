import { Context, Effect, Layer } from "effect";
import { AuthError } from "supabase";

import { SupabaseClientError } from "./errors.ts";
import { SupabaseClientService } from './supabase.ts';

const getEmptyUsersList = () => Effect.succeed({
	users: [],
	aud: "test-audience",
	nextPage: null,
	lastPage: 1,
	total: 0,
});

export const supabaseServiceFactory = (
	overrides: Partial<Context.Tag.Service<SupabaseClientService>>,
) =>
	Layer.succeed(SupabaseClientService, {
		adminListUsers: getEmptyUsersList,
		...overrides,
});

export const makeFailedSupabaseRequest = () =>
	supabaseServiceFactory({
		adminListUsers: () =>
			Effect.fail(new SupabaseClientError({
				cause: "mock failure",
			})),
	});

export const makeUnauthorizedSupabaseRequest = () =>
	supabaseServiceFactory({
		adminListUsers: () =>
			Effect.fail(new AuthError("Mock failure")),
	});

