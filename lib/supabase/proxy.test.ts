// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const { getClaims, getUser } = vi.hoisted(() => ({
	getClaims: vi.fn(),
	getUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
	createServerClient: () => ({
		auth: { getClaims, getUser },
	}),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";

const { updateSession } = await import("./proxy");

describe("updateSession", () => {
	it("redirects a valid-looking JWT whose user no longer exists", async () => {
		getClaims.mockResolvedValue({
			data: { claims: { sub: "user-1" } },
			error: null,
		});
		getUser.mockResolvedValue({
			data: { user: null },
			error: new Error("session not found"),
		});

		const response = await updateSession(
			new NextRequest("http://localhost/protected"),
		);

		expect(response.status).toBe(307);
		expect(new URL(response.headers.get("location")!).pathname).toBe(
			"/auth/login",
		);
	});
});
