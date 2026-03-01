import { ConfigProvider, Layer } from "effect";

const DenoEnvConfigProvider = ConfigProvider.fromMap(
	new Map(Object.entries(Deno.env.toObject())),
);

export const ConfigLayer = Layer.setConfigProvider(DenoEnvConfigProvider);

