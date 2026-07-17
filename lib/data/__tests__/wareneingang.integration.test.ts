// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdWareneingangIds: string[] = [];
const createdWareneingangspositionIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdProduktIds: string[] = [];
const createdProfilIds: string[] = [];

afterAll(async () => {
	if (createdWareneingangspositionIds.length > 0) {
		await supabase
			.from("tb_wareneingangsposition")
			.delete()
			.in("id", createdWareneingangspositionIds);
	}
	if (createdWareneingangIds.length > 0) {
		await supabase
			.from("tb_wareneingang")
			.delete()
			.in("id", createdWareneingangIds);
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

const PROFIL_ID = "d4a54cc9-8a48-45dc-8f52-31092d2acbda";

async function createProfil(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_profil")
		.upsert({ id: PROFIL_ID, name: `test-${uid()}`, rolle: "mitarbeiter", telefon: null, aktiv: true, ...overrides })
		.select()
		.single();

	if (error) throw error;
	return data;
}

async function createWareneingang(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const profil = await createProfil();

	const { data, error } = await supabase
		.from("tb_wareneingang")
		.insert({
			saison_id: saison.id,
			stand_id: stand.id,
			erfasst_von: profil.id,
			datum: "2026-06-15",
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdWareneingangIds.push(data.id);
	return data;
}

describe("tb_wareneingang CRUD", () => {
	it("creates wareneingang with given datum", async () => {
		const we = await createWareneingang();
		expect(we.datum).toBe("2026-06-15");
		expect(we.saison_id).toBeDefined();
		expect(we.stand_id).toBeDefined();
		expect(we.erfasst_von).toBeDefined();
	});

	it("creates wareneingang with custom datum", async () => {
		const we = await createWareneingang({ datum: "2026-07-01" });
		expect(we.datum).toBe("2026-07-01");
	});

	it("reads all wareneingaenge", async () => {
		const created = await createWareneingang();
		const { data, error } = await supabase.from("tb_wareneingang").select("*");

		expect(error).toBeNull();
		expect(data?.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates wareneingang datum", async () => {
		const we = await createWareneingang();
		const { data, error } = await supabase
			.from("tb_wareneingang")
			.update({ datum: "2026-08-01" })
			.eq("id", we.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.datum).toBe("2026-08-01");
	});

	it("deletes wareneingang", async () => {
		const we = await createWareneingang();
		const { error } = await supabase
			.from("tb_wareneingang")
			.delete()
			.eq("id", we.id);

		expect(error).toBeNull();
	});
});

describe("tb_wareneingang by saison", () => {
	it("filters wareneingaenge by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const profil = await createProfil();

		const { data: w1 } = await supabase
			.from("tb_wareneingang")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				erfasst_von: profil.id,
				datum: "2026-06-15",
			})
			.select()
			.single();

		const { data: w2 } = await supabase
			.from("tb_wareneingang")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				erfasst_von: profil.id,
				datum: "2026-07-01",
			})
			.select()
			.single();

		if (w1) createdWareneingangIds.push(w1.id);
		if (w2) createdWareneingangIds.push(w2.id);

		const { data, error } = await supabase
			.from("tb_wareneingang")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.id).sort()).toEqual([w1?.id, w2?.id].sort());
	});
});

describe("tb_wareneingang RPC", () => {
	it("creates wareneingang with 2 positions atomically", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.rpc(
			"create_wareneingang_mit_positionen",
			{
				p_wareneingang: {
					saison_id: saison.id,
					stand_id: stand.id,
					erfasst_von: profil.id,
					datum: "2026-06-15",
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 10,
					},
					{
						produkt_id: produkt.id,
						menge: 5,
					},
				],
			},
		);

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		// Verify header exists
		const { data: header } = await supabase
			.from("tb_wareneingang")
			.select("*")
			.eq("id", data!.id)
			.single();

		expect(header?.datum).toBe("2026-06-15");

		// Verify 2 positions created
		const { data: pos } = await supabase
			.from("tb_wareneingangsposition")
			.select("*")
			.eq("wareneingang_id", data!.id);

		expect(pos?.length).toBe(2);

		// Cleanup
		createdWareneingangIds.push(data!.id);
		for (const p of pos || []) {
			createdWareneingangspositionIds.push(p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.rpc(
			"create_wareneingang_mit_positionen",
			{
				p_wareneingang: {
					saison_id: saison.id,
					stand_id: stand.id,
					erfasst_von: profil.id,
					datum: "2026-06-15",
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 0,
					},
				],
			},
		);

		// Should fail - menge > 0 CHECK constraint in DB
		expect(error).not.toBeNull();
		expect(data).toBeNull();
	});
});
