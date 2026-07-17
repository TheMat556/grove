// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestCrud, getClient, createTestProfil, deleteTestAuthUser } from "./test-utils";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { standortInsertSchema } from "@/lib/schemas/standort";
import { standInsertSchema } from "@/lib/schemas/stand";
import { kundeInsertSchema } from "@/lib/schemas/kunde";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";

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

const crudKunde = createTestCrud({
	table: "tb_kunde",
	insertSchema: kundeInsertSchema,
	labels: { singular: "Kunde", plural: "Kunden" },
});

const crudReservierung = createTestCrud({
	table: "tb_reservierung",
	insertSchema: reservierungInsertSchema,
	labels: { singular: "Reservierung", plural: "Reservierungen" },
});

const createdReservierungIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdKundeIds: string[] = [];
const createdAuthUserIds: string[] = [];

let sharedProfilId: string;

beforeAll(async () => {
	const profil = await createTestProfil();
	sharedProfilId = profil.id;
	createdAuthUserIds.push(profil.id);
});

afterAll(async () => {
	if (createdReservierungIds.length > 0) {
		await getClient()
			.from("tb_reservierung")
			.delete()
			.in("id", createdReservierungIds);
	}
	if (createdStandIds.length > 0) {
		await getClient().from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await getClient().from("tb_standort").delete().in("id", createdStandortIds);
	}
	if (createdKundeIds.length > 0) {
		await getClient().from("tb_kunde").delete().in("id", createdKundeIds);
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

async function createKunde(overrides: Partial<Record<string, unknown>> = {}) {
	const kunde = await crudKunde.create({
		name: `test-${uid()}`,
		telefon: `+49-${uid()}`,
		adresse: `${uid()}-Straße 1`,
		ist_firma: false,
		...overrides,
	});
	createdKundeIds.push(kunde.id);
	return kunde;
}

async function createProfil() {
	return { id: sharedProfilId };
}

async function createReservierung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const stand = await createStand();
	const kunde = await createKunde();
	const profil = await createProfil();

	const r = await crudReservierung.create({
		saison_id: saison.id,
		stand_id: stand.id,
		kunde_id: kunde.id,
		profil_id: profil.id,
		versandart: "abholung",
		geplantes_datum: "2026-06-15",
		...overrides,
	});
	createdReservierungIds.push(r.id);
	return r;
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
		const all = await crudReservierung.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates reservierung versandart", async () => {
		const r = await createReservierung();
		const updated = await crudReservierung.update(r.id, { versandart: "lieferung" });

		expect(updated.versandart).toBe("lieferung");
	});

	it("deletes reservierung", async () => {
		const r = await createReservierung();
		await crudReservierung.remove(r.id);
	});
});

describe.skipIf(!hasSupabase)("tb_reservierung by saison", () => {
	it("filters reservierungen by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const kunde = await createKunde();
		const profil = await createProfil();

		const r1 = await crudReservierung.create({
			saison_id: saison.id,
			stand_id: stand.id,
			kunde_id: kunde.id,
			profil_id: profil.id,
			versandart: "abholung",
			geplantes_datum: "2026-07-01",
		});
		createdReservierungIds.push(r1.id);

		const r2 = await crudReservierung.create({
			saison_id: saison.id,
			stand_id: stand.id,
			kunde_id: kunde.id,
			profil_id: profil.id,
			versandart: "lieferung",
			geplantes_datum: "2026-07-15",
		});
		createdReservierungIds.push(r2.id);

		const data = await crudReservierung.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([r1.id, r2.id].sort());
	});
});
