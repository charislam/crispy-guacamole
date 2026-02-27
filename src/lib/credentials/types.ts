import type { Redacted } from "effect";

export type SupabaseCredentials = { url: string; key: Redacted<string> };

type BaseCredentialsState = {
	status: "unknown" | "known";
	credentials: SupabaseCredentials | null;
};

export type UnknownCredentialsState = BaseCredentialsState & {
	status: "unknown";
	credentials: null;
};

export type KnownCredentialsState = BaseCredentialsState & {
	status: "known";
	credentials: SupabaseCredentials;
};

export type CredentialsState = UnknownCredentialsState | KnownCredentialsState;
