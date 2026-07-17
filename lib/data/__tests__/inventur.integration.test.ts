// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdInventurIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdProduktIds: string[] = [];
const createdProfilIds: string[] = [];

afterAll(async () => {
	if (createdInventurIds.length > 0) {
		await supabase.from("tb_inventur").delete().in("id", createdInventurIds);
	}
	if (createdStandIds.length > 0) {
		await supabase.from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await supabase.from("tb_standort").delete().in("id", createdStandortIds);
	}
	if (createdProduktIds.length > 0) {
		await supabase.from("tb_produkt").delete().in("id", createdProduktIds);
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

async function createProdukt(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_produkt")
		.insert({
			bezeichnung: `test-${uid()}`,
			art: "Baum",
			von_cm: 0,
			bis_cm: 100,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdProduktIds.push(data.id);
	return data;
}

const PROFIL_ID = "3e901eea-9b29-4084-b164-b931b5498a92";

async function createProfil(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_profil")
		.upsert({ id: PROFIL_ID, name: `test-${uid()}`, rolle: "mitarbeiter", telefon: null, aktiv: true, ...overrides })
		.select()
		.single();

	if (error) throw error;
	return data;
}

async function createInventur(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const produkt = await createProdukt();
	const profil = await createProfil();

	const { data, error } = await supabase
		.from("tb_inventur")
		.insert({
			saison_id: saison.id,
			stand_id: stand.id,
			produkt_id: produkt.id,
			profil_id: profil.id,
			datum: "2026-06-15",
			differenz: 5,
			grund: null,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdInventurIds.push(data.id);
	return data;
}

describe("tb_inventur CRUD", () => {
	it("creates inventur with given differenz", async () => {
		const inv = await createInventur();
		expect(inv.differenz).toBe(5);
		expect(inv.datum).toBe("2026-06-15");
		expect(inv.saison_id).toBeDefined();
		expect(inv.stand_id).toBeDefined();
		expect(inv.produkt_id).toBeDefined();
		expect(inv.profil_id).toBeDefined();
	});

	it("creates inventur with grund", async () => {
		const inv = await createInventur({ grund: "Zählt differenz" });
		expect(inv.grund).toBe("Zählt differenz");
	});

	it("reads all inventuren", async () => {
		const created = await createInventur();
		const { data, error } = await supabase.from("tb_inventur").select("*");

		expect(error).toBeNull();
		expect(data?.some((i) => i.id === created.id)).toBe(true);
	});

	it("updates inventur differenz", async () => {
		const inv = await createInventur();
		const { data, error } = await supabase
			.from("tb_inventur")
			.update({ differenz: -3 })
			.eq("id", inv.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.differenz).toBe(-3);
	});

	it("deletes inventur", async () => {
		const inv = await createInventur();
		const { error } = await supabase
			.from("tb_inventur")
			.delete()
			.eq("id", inv.id);

		expect(error).toBeNull();
	});
});

describe("tb_inventur by saison", () => {
	it("filters inventuren by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data: i1 } = await supabase
			.from("tb_inventur")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				produkt_id: produkt.id,
				profil_id: profil.id,
				datum: "2026-06-15",
				differenz: 5,
				grund: null,
			})
			.select()
			.single();

		const { data: i2 } = await supabase
			.from("tb_inventur")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				produkt_id: produkt.id,
				profil_id: profil.id,
				datum: "2026-07-01",
				differenz: -2,
				grund: "Retoure",
			})
			.select()
			.single();

		if (i1) createdInventurIds.push(i1.id);
		if (i2) createdInventurIds.push(i2.id);

		const { data, error } = await supabase
			.from("tb_inventur")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((i) => i.id).sort()).toEqual([i1?.id, i2?.id].sort());
	});
});
