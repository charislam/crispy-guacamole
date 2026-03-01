import { Context, Effect, Layer, Redacted } from "effect";

import { RequestService } from "./request.ts";
import { UnauthorizedError } from "./errors.ts";

const failAuth = () => Effect.fail(new UnauthorizedError());
const seedAuthToken = (token: string) => () =>
	Effect.succeed(Redacted.make(token));

const createEmptyBody = () => Effect.succeed({});
const createInvalidJsonBody = () => Effect.succeed({ invalid: true });
const createValidJsonBody = (query = "test query") => Effect.succeed({ query });

export const requestServiceFactory = (
	overrides: Partial<Context.Tag.Service<RequestService>>,
) =>
	Layer.succeed(RequestService, {
		getUncheckedAuth: failAuth,
		getJsonBody: createEmptyBody,
		...overrides,
	});

export const makeRequestWithAuthToken = (token: string) =>
	requestServiceFactory({
		getUncheckedAuth: seedAuthToken(token),
	});

export const makeRequestWithInvalidJson = () =>
	requestServiceFactory({
		getJsonBody: createInvalidJsonBody,
	});

export const makeRequestWithValidQuery = (query?: string) =>
	requestServiceFactory({
		getJsonBody: () => createValidJsonBody(query),
	});
