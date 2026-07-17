// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";
import { createTestProfil, deleteTestAuthUser } from "./test-utils";

const supabase = createTestClient();
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
	const { data, error } = await supabase
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
		const { data, error } = await supabase.from("tb_profil").select("*");

		expect(error).toBeNull();
		expect(data?.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates profil name", async () => {
		const profil = await createProfilFixture();
		const { data, error } = await supabase
			.from("tb_profil")
			.update({ name: `updated-${Math.random().toString(36).slice(2, 8)}` })
			.eq("id", profil.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.name).not.toBe(profil.name);
	});

	it("deletes profil", async () => {
		const profil = await createProfilFixture();
		const { error } = await supabase
			.from("tb_profil")
			.delete()
			.eq("id", profil.id);

		expect(error).toBeNull();
	});
});
