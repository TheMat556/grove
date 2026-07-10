import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: "./vitest.setup.ts",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["lcov", "text-summary"],
			include: ["app/**", "lib/**", "components/**"],
			exclude: [
				"**/node_modules/**",
				"**/.next/**",
				"**/*.test.ts",
				"**/*.test.tsx",
			],
		},
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "./") },
	},
});
