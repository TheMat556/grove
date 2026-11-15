// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAdminClient } = vi.hoisted(() => ({
	createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));

import { createProfilMitAuth } from "./profil";

const eingabe = {
	email: "maria@grove.de",
	passwort: "sicheresPasswort",
	name: "Maria Huber",
	rolle: "mitarbeiter" as const,
	telefon: null,
	aktiv: true,
};

/** Minimaler Ersatz für den Service-Role-Client rund um den Profil-Update. */
function fakeClient(opts: {
	profilError?: { message: string } | null;
	deleteError?: { message: string } | null;
}) {
	const createUser = vi.fn(async () => ({
		data: { user: { id: "user-1" } },
		error: null,
	}));
	const deleteUser = vi.fn(async () => ({ error: opts.deleteError ?? null }));
	const single = vi.fn(async () => ({
		data: null,
		error: opts.profilError ?? null,
	}));
	const eq = vi.fn(() => ({ select: () => ({ single }) }));
	const update = vi.fn(() => ({ eq }));
	const from = vi.fn(() => ({ update }));

	return {
		auth: { admin: { createUser, deleteUser } },
		from,
		deleteUser,
	};
}

describe("createProfilMitAuth – Kompensation bei fehlgeschlagenem Profil-Update", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("löscht den angelegten Auth-User wieder", async () => {
		const client = fakeClient({ profilError: { message: "DB kaputt" } });
		createAdminClient.mockReturnValue(client);

		await expect(createProfilMitAuth(eingabe)).rejects.toThrow(
			"Profil konnte nicht gespeichert werden: DB kaputt",
		);
		expect(client.deleteUser).toHaveBeenCalledWith("user-1");
	});

	it("nennt die User-ID, wenn auch das Aufräumen scheitert", async () => {
		const client = fakeClient({
			profilError: { message: "DB kaputt" },
			deleteError: { message: "Auth weg" },
		});
		createAdminClient.mockReturnValue(client);

		await expect(createProfilMitAuth(eingabe)).rejects.toThrow(
			/DB kaputt.*user-1.*Auth weg/,
		);
	});
});
