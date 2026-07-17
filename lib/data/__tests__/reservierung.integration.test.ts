// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdReservierungIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdKundeIds: string[] = [];
const createdProfilIds: string[] = [];

afterAll(async () => {
	if (createdReservierungIds.length > 0) {
		await supabase
			.from("tb_reservierung")
			.delete()
			.in("id", createdReservierungIds);
	}
	if (createdStandIds.length > 0) {
		await supabase.from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await supabase.from("tb_standort").delete().in("id", createdStandortIds);
	}
	if (createdKundeIds.length > 0) {
		await supabase.from("tb_kunde").delete().in("id", createdKundeIds);
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

async function createKunde(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_kunde")
		.insert({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1`,
			ist_firma: false,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdKundeIds.push(data.id);
	return data;
}

const PROFIL_ID = "ee8e77e4-e4fa-4641-8597-6c8ea55caf70";

async function createProfil(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_profil")
		.upsert({
			id: PROFIL_ID,
			name: `test-${uid()}`,
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

async function createReservierung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const kunde = await createKunde();
	const profil = await createProfil();

	const { data, error } = await supabase
		.from("tb_reservierung")
		.insert({
			saison_id: saison.id,
			stand_id: stand.id,
			kunde_id: kunde.id,
			profil_id: profil.id,
			versandart: "abholung",
			geplantes_datum: "2026-06-15",
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdReservierungIds.push(data.id);
	return data;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_reservierung CRUD", () => {
	it("creates reservierung with given values", async () => {
		const r = await createReservierung();
		expect(r.versandart).toBe("abholung");
		expect(r.geplantes_datum).toBe("2026-06-15");
		expect(r.status).toBe("offen");
		expect(r.saison_id).toBeDefined();
		expect(r.stand_id).toBeDefined();
		expect(r.kunde_id).toBeDefined();
		expect(r.profil_id).toBeDefined();
	});

	it("reads all reservierungen", async () => {
		const created = await createReservierung();
		const { data, error } = await supabase.from("tb_reservierung").select("*");

		expect(error).toBeNull();
		expect(data?.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates reservierung versandart", async () => {
		const r = await createReservierung();
		const { data, error } = await supabase
			.from("tb_reservierung")
			.update({ versandart: "lieferung" })
			.eq("id", r.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.versandart).toBe("lieferung");
	});

	it("deletes reservierung", async () => {
		const r = await createReservierung();
		const { error } = await supabase
			.from("tb_reservierung")
			.delete()
			.eq("id", r.id);

		expect(error).toBeNull();
	});
});

describe.skipIf(!hasSupabase)("tb_reservierung by saison", () => {
	it("filters reservierungen by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const kunde = await createKunde();
		const profil = await createProfil();

		const { data: r1 } = await supabase
			.from("tb_reservierung")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				kunde_id: kunde.id,
				profil_id: profil.id,
				versandart: "abholung",
				geplantes_datum: "2026-07-01",
			})
			.select()
			.single();

		const { data: r2 } = await supabase
			.from("tb_reservierung")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				kunde_id: kunde.id,
				profil_id: profil.id,
				versandart: "lieferung",
				geplantes_datum: "2026-07-15",
			})
			.select()
			.single();

		if (r1) createdReservierungIds.push(r1.id);
		if (r2) createdReservierungIds.push(r2.id);

		const { data, error } = await supabase
			.from("tb_reservierung")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.id).sort()).toEqual([r1?.id, r2?.id].sort());
	});
});
