// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfilMitAuth } from "@/lib/data/profil";
import { profilInsertSchema } from "@/lib/schemas/profil";
import {
	createTestCrud,
	createTestProfil,
	deleteTestAuthUser,
	getClient,
} from "./test-utils";

const crud = createTestCrud({
	table: "tb_profil",
	insertSchema: profilInsertSchema,
	labels: { singular: "Profil", plural: "Profile" },
});

const created: string[] = [];

let profilId1: string;
let profilId2: string;

beforeAll(async () => {
	const p1 = await createTestProfil();
	const p2 = await createTestProfil();
	profilId1 = p1.id;
	profilId2 = p2.id;
	created.push(p1.id, p2.id);
});

afterAll(async () => {
	for (const id of created) {
		await deleteTestAuthUser(id);
	}
});

let profilIdx = 0;

function getProfilIds(): [string, string] {
	return [profilId1, profilId2];
}

async function createProfilFixture(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const profilIds = getProfilIds();
	const id = profilIds[profilIdx++ % profilIds.length];
	const { data, error } = await getClient()
		.from("tb_profil")
		.upsert({
			id,
			name: `test-${Math.random().toString(36).slice(2, 8)}`,
			rolle: "mitarbeiter",
			telefon: null,
			aktiv: true,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_profil auto-create", () => {
	it("creates a profil for a new auth user", async () => {
		const email = `auto-${Date.now()}@test.test`;
		const { data: authData, error } = await getClient().auth.admin.createUser({
			email,
			password: "test123",
			email_confirm: true,
		});
		if (error) throw error;
		created.push(authData.user.id);

		const { data, error: profilError } = await getClient()
			.from("tb_profil")
			.select("*")
			.eq("id", authData.user.id)
			.maybeSingle();

		expect(profilError).toBeNull();
		expect(data?.id).toBe(authData.user.id);
		expect(data?.name).toBeTruthy();
	});
});

describe.skipIf(!hasSupabase)("tb_profil CRUD", () => {
	it("creates profil with explicit id", async () => {
		const profil = await createProfilFixture();
		expect(profil.id).toBeDefined();
		expect(profil.name).toContain("test-");
	});

	it("creates profil as admin", async () => {
		const profil = await createProfilFixture({ rolle: "admin" });
		expect(profil.rolle).toBe("admin");
	});

	it("reads all profile", async () => {
		const created = await createProfilFixture();
		const all = await crud.getAll();

		expect(all.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates profil name", async () => {
		const profil = await createProfilFixture();
		const updated = await crud.update(profil.id, {
			name: `updated-${Math.random().toString(36).slice(2, 8)}`,
		});

		expect(updated.name).not.toBe(profil.name);
	});

	it("deletes profil", async () => {
		const profil = await createProfilFixture();
		await crud.remove(profil.id);
	});
});

describe.skipIf(!hasSupabase)("createProfilMitAuth", () => {
	// createProfilMitAuth nutzt den Service-Role-Client der App, nicht den
	// Test-Client – für den Test werden dessen Env-Variablen gesetzt.
	const env = process.env;
	const vorher = {
		url: env.NEXT_PUBLIC_SUPABASE_URL,
		key: env.SUPABASE_SERVICE_ROLE_KEY,
	};

	beforeAll(() => {
		env.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_TEST_URL;
		env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_TEST_SERVICE_KEY;
	});

	afterAll(() => {
		env.NEXT_PUBLIC_SUPABASE_URL = vorher.url;
		env.SUPABASE_SERVICE_ROLE_KEY = vorher.key;
	});

	it("legt Auth-User und Profil mit Rolle, Telefon und Status an", async () => {
		const profil = await createProfilMitAuth({
			email: `neu-${Date.now()}@test.test`,
			passwort: "sicheresPasswort",
			name: "Neue Person",
			rolle: "admin",
			telefon: "+43 664 111",
			aktiv: false,
		});
		created.push(profil.id);

		expect(profil.name).toBe("Neue Person");
		expect(profil.rolle).toBe("admin");
		expect(profil.telefon).toBe("+43 664 111");
		expect(profil.aktiv).toBe(false);
	});

	it("meldet eine bereits vergebene E-Mail", async () => {
		const email = `doppelt-${Date.now()}@test.test`;
		const erstes = await createProfilMitAuth({
			email,
			passwort: "sicheresPasswort",
			name: "Erste Person",
			rolle: "mitarbeiter",
			telefon: null,
			aktiv: true,
		});
		created.push(erstes.id);

		await expect(
			createProfilMitAuth({
				email,
				passwort: "anderesPasswort",
				name: "Zweite Person",
				rolle: "mitarbeiter",
				telefon: null,
				aktiv: true,
			}),
		).rejects.toThrow(/Profil konnte nicht angelegt werden/);
	});
});
