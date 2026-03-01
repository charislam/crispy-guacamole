import { Cause, Effect, Exit, Option } from "effect";
import { expect, it } from "vitest";

import { validateDto } from "./dto.ts";

it("should fail on invalid DTO", async () => {
	const invalidDto = { invalid: true };
	const program = validateDto(invalidDto);

	const result = await Effect.runPromiseExit(program);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const causeOpt = Cause.failureOption(result.cause);
		expect(Option.isSome(causeOpt) && causeOpt.value._tag).toBe(
			"InvalidRequestError",
		);
	}
});

it("should fail on empty string", async () => {
	const invalidDto = { query: "" };
	const program = validateDto(invalidDto);

	const result = await Effect.runPromiseExit(program);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const causeOpt = Cause.failureOption(result.cause);
		expect(Option.isSome(causeOpt) && causeOpt.value._tag).toBe(
			"InvalidRequestError",
		);
	}
});

it("should fail on whitespace-only string", async () => {
	const invalidDto = { query: "   " };
	const program = validateDto(invalidDto);

	const result = await Effect.runPromiseExit(program);
	expect(Exit.isFailure(result)).toBe(true);
	if (Exit.isFailure(result)) {
		const causeOpt = Cause.failureOption(result.cause);
		expect(Option.isSome(causeOpt) && causeOpt.value._tag).toBe(
			"InvalidRequestError",
		);
	}
});

it("should extract non-empty string", async () => {
	const invalidDto = { query: "test" };
	const program = validateDto(invalidDto);

	const result = await Effect.runPromiseExit(program);
	expect(Exit.isSuccess(result)).toBe(true);
	if (Exit.isSuccess(result)) {
		expect(result.value).toBe("test");
	}
});

it("should trim whitespace from parsed string", async () => {
	const invalidDto = { query: "  test    " };
	const program = validateDto(invalidDto);

	const result = await Effect.runPromiseExit(program);
	expect(Exit.isSuccess(result)).toBe(true);
	if (Exit.isSuccess(result)) {
		expect(result.value).toBe("test");
	}
});
