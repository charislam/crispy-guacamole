import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			supabase: "@supabase/supabase-js",
		},
	},
	test: {
		include: ["./**/*.test.ts"],
	},
});
