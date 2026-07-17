// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdEinsatzIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdProfilIds: string[] = [];

afterAll(async () => {
	if (createdEinsatzIds.length > 0) {
		await supabase.from("tb_einsatz").delete().in("id", createdEinsatzIds);
	}
	if (createdStandIds.length > 0) {
		await supabase.from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await supabase.from("tb_standort").delete().in("id", createdStandortIds);
	}
	if (createdProfilIds.length > 0) {
		await supabase.from("tb_profil").delete().in("id", createdProfilIds);
	}
	if (createdSaisonIds.length > 0) {
		await supabase.from("tb_saison").delete().in("id", createdSaisonIds);
	}
});

async function createSaison(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_saison")
		.insert({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdSaisonIds.push(data.id);
	return data;
}

async function createStandort(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const { data, error } = await supabase
		.from("tb_standort")
		.insert({
			ort: `test-${uid()}`,
			plz: 12345,
			adresse: `${uid()}-Straße 1`,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdStandortIds.push(data.id);
	return data;
}

async function createStand(overrides: Partial<Record<string, unknown>> = {}) {
	const standort = await createStandort();
	const { data, error } = await supabase
		.from("tb_stand")
		.insert({
			bezeichnung: `test-${uid()}`,
			standort_id: standort.id,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdStandIds.push(data.id);
	return data;
}

const PROFIL_ID = "c7d6cbff-34a2-4f8a-9b82-37f1071b17d1";

async function createProfil(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_profil")
		.upsert({ id: PROFIL_ID, name: `test-${uid()}`, rolle: "mitarbeiter", telefon: null, aktiv: true, ...overrides })
		.select()
		.single();

	if (error) throw error;
	return data;
}

async function createEinsatz(overrides: Partial<Record<string, unknown>> = {}) {
	const saison = await createSaison();
	const stand = await createStand();
	const profil = await createProfil();

	const { data, error } = await supabase
		.from("tb_einsatz")
		.insert({
			saison_id: saison.id,
			stand_id: stand.id,
			profil_id: profil.id,
			von: "2026-06-15",
			bis: null,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdEinsatzIds.push(data.id);
	return data;
}

describe("tb_einsatz CRUD", () => {
	it("creates einsatz with given von", async () => {
		const e = await createEinsatz();
		expect(e.von).toBe("2026-06-15");
		expect(e.bis).toBeNull();
		expect(e.saison_id).toBeDefined();
		expect(e.stand_id).toBeDefined();
		expect(e.profil_id).toBeDefined();
	});

	it("creates einsatz with bis", async () => {
		const e = await createEinsatz({ bis: "2026-07-15" });
		expect(e.bis).toBe("2026-07-15");
	});

	it("reads all einsätze", async () => {
		const created = await createEinsatz();
		const { data, error } = await supabase.from("tb_einsatz").select("*");

		expect(error).toBeNull();
		expect(data?.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates einsatz von", async () => {
		const e = await createEinsatz();
		const { data, error } = await supabase
			.from("tb_einsatz")
			.update({ von: "2026-07-01" })
			.eq("id", e.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.von).toBe("2026-07-01");
	});

	it("deletes einsatz", async () => {
		const e = await createEinsatz();
		const { error } = await supabase.from("tb_einsatz").delete().eq("id", e.id);

		expect(error).toBeNull();
	});
});

describe("tb_einsatz by saison", () => {
	it("filters einsätze by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const profil = await createProfil();

		const { data: e1 } = await supabase
			.from("tb_einsatz")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				von: "2026-06-15",
				bis: null,
			})
			.select()
			.single();

		const { data: e2 } = await supabase
			.from("tb_einsatz")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				von: "2026-07-01",
				bis: "2026-07-15",
			})
			.select()
			.single();

		if (e1) createdEinsatzIds.push(e1.id);
		if (e2) createdEinsatzIds.push(e2.id);

		const { data, error } = await supabase
			.from("tb_einsatz")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.id).sort()).toEqual([e1?.id, e2?.id].sort());
	});
});
