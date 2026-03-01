import {
	Config,
	Context,
	Effect,
	Layer,
	Redacted
} from "effect";
import { type AuthError, createClient, type GoTrueAdminApi } from "supabase";

import { SupabaseClientError } from "./errors.ts";
import { RequestService } from "./request.ts";

type AdminListUsersData = Extract<
	Awaited<ReturnType<GoTrueAdminApi["listUsers"]>>,
	{ error: null }
>["data"];

export class SupabaseClientService extends Context.Tag("SupabaseClientService")<
	SupabaseClientService,
	{ adminListUsers: () => Effect.Effect<AdminListUsersData, AuthError | SupabaseClientError> }
>() {}

export const SupabaseClientLive = Layer.effect(
	SupabaseClientService,
	Effect.gen(function* () {
		const requestService = yield* RequestService;
		const supabaseUrl = yield* Config.string("SUPABASE_URL");

		return {
			adminListUsers: () =>
				requestService.getUncheckedAuth().pipe(
					Effect.flatMap((key) => {
						const client = createClient(supabaseUrl, Redacted.value(key));
						return Effect.tryPromise(() => client.auth.admin.listUsers({ perPage: 1 })).pipe(
							Effect.flatMap((res) =>
								res.error ? Effect.fail(res.error) : Effect.succeed(res.data),
							),
							Effect.mapError((err) => new SupabaseClientError({ cause: err })),
						);
					}),
				),
		};
	}),
);
