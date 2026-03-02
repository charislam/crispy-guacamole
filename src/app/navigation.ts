import { Context, Effect, SubscriptionRef } from "effect";

export interface NavigationService {
	readonly navigate: (path: string) => Effect.Effect<void>;
}

export type NavigationEventsStream = SubscriptionRef.SubscriptionRef<string>;

export const Navigation =
	Context.GenericTag<NavigationService>("@app/Navigation");

export const NavigationEvents = Context.GenericTag<NavigationEventsStream>(
	"@app/NavigationEvents",
);
