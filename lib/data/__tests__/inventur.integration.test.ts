// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestCrud, getClient, createTestProfil, deleteTestAuthUser } from "./test-utils";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { standortInsertSchema } from "@/lib/schemas/standort";
import { standInsertSchema } from "@/lib/schemas/stand";
import { produktInsertSchema } from "@/lib/schemas/produkt";
import { inventurInsertSchema } from "@/lib/schemas/inventur";

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

const crudInventur = createTestCrud({
	table: "tb_inventur",
	insertSchema: inventurInsertSchema,
	labels: { singular: "Inventur", plural: "Inventuren" },
});

const createdInventurIds: string[] = [];
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
	if (createdInventurIds.length > 0) {
		await getClient().from("tb_inventur").delete().in("id", createdInventurIds);
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
		plz: 12345,
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

async function createInventur(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const produkt = await createProdukt();
	const profil = await createProfil();

	const inv = await crudInventur.create({
		saison_id: saison.id,
		stand_id: stand.id,
		produkt_id: produkt.id,
		profil_id: profil.id,
		datum: "2026-06-15",
		differenz: 5,
		grund: null,
		...overrides,
	});
	createdInventurIds.push(inv.id);
	return inv;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_inventur CRUD", () => {
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
		const all = await crudInventur.getAll();

		expect(all.some((i) => i.id === created.id)).toBe(true);
	});

	it("updates inventur differenz", async () => {
		const inv = await createInventur();
		const updated = await crudInventur.update(inv.id, { differenz: -3 });

		expect(updated.differenz).toBe(-3);
	});

	it("deletes inventur", async () => {
		const inv = await createInventur();
		await crudInventur.remove(inv.id);
	});
});

describe.skipIf(!hasSupabase)("tb_inventur by saison", () => {
	it("filters inventuren by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const produkt = await createProdukt();
		const profil = await createProfil();

		const i1 = await crudInventur.create({
			saison_id: saison.id,
			stand_id: stand.id,
			produkt_id: produkt.id,
			profil_id: profil.id,
			datum: "2026-06-15",
			differenz: 5,
			grund: null,
		});
		createdInventurIds.push(i1.id);

		const i2 = await crudInventur.create({
			saison_id: saison.id,
			stand_id: stand.id,
			produkt_id: produkt.id,
			profil_id: profil.id,
			datum: "2026-07-01",
			differenz: -2,
			grund: "Retoure",
		});
		createdInventurIds.push(i2.id);

		const data = await crudInventur.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((i) => i.id).sort()).toEqual([i1.id, i2.id].sort());
	});
});
