import { Context, Effect } from "effect";

export interface NavigationService {
	readonly navigate: (path: string) => Effect.Effect<void>;
}

export const Navigation =
	Context.GenericTag<NavigationService>("@app/Navigation");
