import path from "node:path";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: ".env.test" });

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
				"**/*.spec.ts",
				"**/*.spec.tsx",
			],
		},
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "./") },
	},
});
