import { beforeEach, describe, expect, it, vi } from "vitest";

// Configurable fakes, reset before each test.
let getUserResult: {
	data: { user: { id: string } | null };
	error: unknown;
};
let profilResult: { data: unknown; error: unknown };

const single = vi.fn(async () => profilResult);
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const getUser = vi.fn(async () => getUserResult);

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(async () => ({
		auth: { getUser },
		from,
	})),
}));

// Imported after the mock is registered.
const { getCurrentProfil, getCurrentProfilId } = await import(
	"@/lib/data/session"
);

beforeEach(() => {
	getUserResult = { data: { user: { id: "user-123" } }, error: null };
	profilResult = {
		data: { id: "user-123", name: "Test", rolle: "mitarbeiter", aktiv: true },
		error: null,
	};
	vi.clearAllMocks();
});

describe("getCurrentProfilId", () => {
	it("returns the authenticated user id", async () => {
		await expect(getCurrentProfilId()).resolves.toBe("user-123");
	});

	it("throws when no user is signed in", async () => {
		getUserResult = { data: { user: null }, error: null };
		await expect(getCurrentProfilId()).rejects.toThrow("Nicht angemeldet.");
	});

	it("throws when auth.getUser returns an error", async () => {
		getUserResult = { data: { user: null }, error: new Error("boom") };
		await expect(getCurrentProfilId()).rejects.toThrow("Nicht angemeldet.");
	});
});

describe("getCurrentProfil", () => {
	it("returns the profil row of the current user", async () => {
		const profil = await getCurrentProfil();
		expect(profil).toMatchObject({ id: "user-123", rolle: "mitarbeiter" });
		expect(eq).toHaveBeenCalledWith("id", "user-123");
	});

	it("throws when not signed in", async () => {
		getUserResult = { data: { user: null }, error: null };
		await expect(getCurrentProfil()).rejects.toThrow("Nicht angemeldet.");
	});

	it("throws when the profil lookup fails", async () => {
		profilResult = { data: null, error: new Error("not found") };
		await expect(getCurrentProfil()).rejects.toThrow(
			"Profil konnte nicht geladen werden.",
		);
	});
});
