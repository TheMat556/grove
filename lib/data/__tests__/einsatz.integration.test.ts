// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { einsatzInsertSchema } from "@/lib/schemas/einsatz";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { standInsertSchema } from "@/lib/schemas/stand";
import { standortInsertSchema } from "@/lib/schemas/standort";
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

const crudEinsatz = createTestCrud({
	table: "tb_einsatz",
	insertSchema: einsatzInsertSchema,
	labels: { singular: "Einsatz", plural: "Einsätze" },
});

const createdEinsatzIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdAuthUserIds: string[] = [];

let sharedProfilId: string;

beforeAll(async () => {
	const profil = await createTestProfil();
	sharedProfilId = profil.id;
	createdAuthUserIds.push(profil.id);
});

afterAll(async () => {
	if (createdEinsatzIds.length > 0) {
		await getClient().from("tb_einsatz").delete().in("id", createdEinsatzIds);
	}
	if (createdStandIds.length > 0) {
		await getClient().from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await getClient().from("tb_standort").delete().in("id", createdStandortIds);
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

async function createProfil() {
	return { id: sharedProfilId };
}

async function createEinsatz(overrides: Partial<Record<string, unknown>> = {}) {
	const saison = await createSaison();
	const stand = await createStand();
	const profil = await createProfil();

	const e = await crudEinsatz.create({
		saison_id: saison.id,
		stand_id: stand.id,
		profil_id: profil.id,
		von: "2026-06-15",
		bis: null,
		...overrides,
	});
	createdEinsatzIds.push(e.id);
	return e;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_einsatz CRUD", () => {
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
		const all = await crudEinsatz.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates einsatz von", async () => {
		const e = await createEinsatz();
		const updated = await crudEinsatz.update(e.id, { von: "2026-07-01" });

		expect(updated.von).toBe("2026-07-01");
	});

	it("deletes einsatz", async () => {
		const e = await createEinsatz();
		await crudEinsatz.remove(e.id);
	});
});

describe.skipIf(!hasSupabase)("tb_einsatz by saison", () => {
	it("filters einsätze by saison_id", async () => {
		const saison = await createSaison();
		const stand = await createStand();
		const profil = await createProfil();

		const e1 = await crudEinsatz.create({
			saison_id: saison.id,
			stand_id: stand.id,
			profil_id: profil.id,
			von: "2026-06-15",
			bis: null,
		});
		createdEinsatzIds.push(e1.id);

		const e2 = await crudEinsatz.create({
			saison_id: saison.id,
			stand_id: stand.id,
			profil_id: profil.id,
			von: "2026-07-01",
			bis: "2026-07-15",
		});
		createdEinsatzIds.push(e2.id);

		const data = await crudEinsatz.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([e1.id, e2.id].sort());
	});
});
