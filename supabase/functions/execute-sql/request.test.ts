import {
	Cause,
	Effect,
	Exit,
	Layer,
	Option,
	Redacted
} from "effect";
import { expect, it } from "vitest";

import { RawRequestService, RequestService, RequestServiceLive } from "./request.ts";

const makeRawRequestService = (req: Request) =>
	Layer.succeed(RawRequestService, req);

it('should fail when Authorization header is missing', async () => {
	const req = new Request("http://localhost");
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		return yield* requestService.getUncheckedAuth();
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const error = Cause.failureOption(result.cause);
		expect(
			Option.isSome(error) && error.value._tag
		).toBe("UnauthorizedError");
	}
});

it('should fail when Authorization header is corrupted', async () => {
	const req = new Request("http://localhost", {
		headers: {
			Authorization: "InvalidHeader",
		},
	});
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		return yield* requestService.getUncheckedAuth();
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const error = Cause.failureOption(result.cause);
		expect(
			Option.isSome(error) && error.value._tag
		).toBe("UnauthorizedError");
	}
});

it("should extract auth token from Authorization header", async () => {
	const token = "test-token";
	const req = new Request("http://localhost", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		const extractedToken = yield* requestService.getUncheckedAuth();
		return extractedToken;
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isSuccess(result)).toBe(true);
	if (Exit.isSuccess(result)) {
		expect(result.value).toEqual(Redacted.make(token));
	}
});

it("should fail when request body is empty", async () => {
	const req = new Request("http://localhost", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: "",
	});
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		return yield* requestService.getJsonBody();
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const error = Cause.failureOption(result.cause);
		expect(
			Option.isSome(error) && error.value.message
		).toMatch(/Invalid JSON body/);
	}
});

it("should fail when request body is invalid JSON", async () => {
	const req = new Request("http://localhost", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: `{ "invalid"`,
	});
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		return yield* requestService.getJsonBody();
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const error = Cause.failureOption(result.cause);
		expect(
			Option.isSome(error) && error.value.message
		).toMatch(/Invalid JSON body/);
	}
});

it("should parse valid JSON body", async () => {
	const req = new Request("http://localhost", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: `{ "valid": true }`,
	});
	const rawRequestLayer = makeRawRequestService(req);

	const requestServiceLayer = Layer.provide(RequestServiceLive, rawRequestLayer);
	const program = Effect.gen(function* () {
		const requestService = yield* RequestService;
		return yield* requestService.getJsonBody();
	});

	const result = await Effect.runPromiseExit(
		Effect.provide(program, requestServiceLayer),
	);
	expect(Exit.isSuccess(result)).toBe(true);
	if (Exit.isSuccess(result)) {
		expect(result.value).toEqual({ valid: true });
	}
});



