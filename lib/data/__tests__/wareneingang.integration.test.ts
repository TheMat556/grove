// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { produktInsertSchema } from "@/lib/schemas/produkt";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { standInsertSchema } from "@/lib/schemas/stand";
import { standortInsertSchema } from "@/lib/schemas/standort";
import { wareneingangInsertSchema } from "@/lib/schemas/wareneingang";
import {
	createTestCrud,
	createTestProfil,
	deleteTestAuthUser,
	getClient,
} from "./test-utils";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const crudSaison = createTestCrud({
	table: "tb_saison",
	insertSchema: saisonInsertSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});

const crudStandort = createTestCrud({
	table: "tb_standort",
	insertSchema: standortInsertSchema,
	labels: { singular: "Standort", plural: "Standorte" },
});

const crudStand = createTestCrud({
	table: "tb_stand",
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
});

const crudProdukt = createTestCrud({
	table: "tb_produkt",
	insertSchema: produktInsertSchema,
	labels: { singular: "Produkt", plural: "Produkte" },
});

const crudWareneingang = createTestCrud({
	table: "tb_wareneingang",
	insertSchema: wareneingangInsertSchema,
	labels: { singular: "Wareneingang", plural: "Wareneingaenge" },
});

const createdWareneingangIds: string[] = [];
const createdWareneingangspositionIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdProduktIds: string[] = [];
const createdAuthUserIds: string[] = [];

let sharedProfilId: string;

beforeAll(async () => {
	const profil = await createTestProfil();
	sharedProfilId = profil.id;
	createdAuthUserIds.push(profil.id);
});

afterAll(async () => {
	if (createdWareneingangspositionIds.length > 0) {
		await getClient()
			.from("tb_wareneingangsposition")
			.delete()
			.in("id", createdWareneingangspositionIds);
	}
	if (createdWareneingangIds.length > 0) {
		await getClient()
			.from("tb_wareneingang")
			.delete()
			.in("id", createdWareneingangIds);
	}
	if (createdStandIds.length > 0) {
		await getClient().from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await getClient().from("tb_standort").delete().in("id", createdStandortIds);
	}
	if (createdProduktIds.length > 0) {
		await getClient().from("tb_produkt").delete().in("id", createdProduktIds);
	}
	if (createdSaisonIds.length > 0) {
		await getClient().from("tb_saison").delete().in("id", createdSaisonIds);
	}
	for (const id of createdAuthUserIds) {
		await deleteTestAuthUser(id);
	}
});

async function createSaison(overrides: Partial<Record<string, unknown>> = {}) {
	const saison = await crudSaison.create({
		name: `test-${uid()}`,
		start_datum: "2026-01-01",
		end_datum: "2026-12-31",
		...overrides,
	});
	createdSaisonIds.push(saison.id);
	return saison;
}

async function createStandort(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const standort = await crudStandort.create({
		ort: `test-${uid()}`,
		plz: 1234,
		adresse: `${uid()}-Straße 1`,
		...overrides,
	});
	createdStandortIds.push(standort.id);
	return standort;
}

async function createStand(overrides: Partial<Record<string, unknown>> = {}) {
	const standort = await createStandort();
	const stand = await crudStand.create({
		bezeichnung: `test-${uid()}`,
		standort_id: standort.id,
		...overrides,
	});
	createdStandIds.push(stand.id);
	return stand;
}

async function createProdukt(overrides: Partial<Record<string, unknown>> = {}) {
	const produkt = await crudProdukt.create({
		bezeichnung: `test-${uid()}`,
		art: "Baum",
		von_cm: 0,
		bis_cm: 100,
		...overrides,
	});
	createdProduktIds.push(produkt.id);
	return produkt;
}

async function createProfil() {
	return { id: sharedProfilId };
}

async function createWareneingang(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const profil = await createProfil();

	const we = await crudWareneingang.create({
		saison_id: saison.id,
		stand_id: stand.id,
		erfasst_von: profil.id,
		datum: "2026-06-15",
		...overrides,
	});
	createdWareneingangIds.push(we.id);
	return we;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_wareneingang CRUD", () => {
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
		const all = await crudWareneingang.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates wareneingang datum", async () => {
		const we = await createWareneingang();
		const updated = await crudWareneingang.update(we.id, {
			datum: "2026-08-01",
		});

		expect(updated.datum).toBe("2026-08-01");
	});

	it("deletes wareneingang", async () => {
		const we = await createWareneingang();
		await crudWareneingang.remove(we.id);
	});
});

describe.skipIf(!hasSupabase)("tb_wareneingang by saison", () => {
	it("filters wareneingaenge by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const profil = await createProfil();

		const w1 = await crudWareneingang.create({
			saison_id: saison.id,
			stand_id: stand.id,
			erfasst_von: profil.id,
			datum: "2026-06-15",
		});
		createdWareneingangIds.push(w1.id);

		const w2 = await crudWareneingang.create({
			saison_id: saison.id,
			stand_id: stand.id,
			erfasst_von: profil.id,
			datum: "2026-07-01",
		});
		createdWareneingangIds.push(w2.id);

		const data = await crudWareneingang.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([w1.id, w2.id].sort());
	});
});

describe.skipIf(!hasSupabase)("tb_wareneingang RPC", () => {
	it("creates wareneingang with 2 positions atomically", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await getClient().rpc(
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
		const { data: header } = await getClient()
			.from("tb_wareneingang")
			.select("*")
			.eq("id", data!.id)
			.single();

		expect(header?.datum).toBe("2026-06-15");

		// Verify 2 positions created
		const { data: pos } = await getClient()
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

		const { data, error } = await getClient().rpc(
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

		// Verify the header insert was rolled back (atomicity). saison.id is unique
		// to this test, so no tb_wareneingang row should reference it.
		const { data: headers } = await getClient()
			.from("tb_wareneingang")
			.select("id")
			.eq("saison_id", saison.id);
		expect(headers).toEqual([]);
	});
});
