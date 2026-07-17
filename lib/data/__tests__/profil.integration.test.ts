// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_profil").delete().in("id", createdIds);
	}
});

const profilIds = ["493580ed-881b-40c0-ba55-6b25f2da0ec8", "ee8e77e4-e4fa-4641-8597-6c8ea55caf70"];
let profilIdx = 0;

async function createProfilFixture(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const id = profilIds[profilIdx++ % profilIds.length];
	const { data, error } = await supabase
		.from("tb_profil")
		.upsert({ id, name: `test-${uid()}`, rolle: "mitarbeiter", telefon: null, aktiv: true, ...overrides })
		.select()
		.single();

	if (error) throw error;
	return data;
}

describe("tb_profil CRUD", () => {
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
			.update({ name: `updated-${uid()}` })
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
