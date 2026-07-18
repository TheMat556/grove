// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { produktInsertSchema } from "@/lib/schemas/produkt";
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

// Lazy-init supabase for the raw afterAll cleanup
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

const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_produkt: [],
	tb_verkauf: [],
	tb_position: [],
};

type TableName =
	| "tb_position"
	| "tb_verkauf"
	| "tb_produkt"
	| "tb_stand"
	| "tb_standort"
	| "tb_saison"
	| "tb_profil";

const cleanupOrder: TableName[] = [
	"tb_position",
	"tb_verkauf",
	"tb_produkt",
	"tb_stand",
	"tb_standort",
	"tb_saison",
	"tb_profil",
];

const createdAuthUserIds: string[] = [];

let sharedProfilId: string;

beforeAll(async () => {
	const profil = await createTestProfil();
	sharedProfilId = profil.id;
	createdAuthUserIds.push(profil.id);
	createdIds.tb_profil.push(profil.id);
});

afterAll(async () => {
	for (const table of cleanupOrder) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await getClient().from(table).delete().in("id", ids);
		}
	}
	for (const id of createdAuthUserIds) {
		await deleteTestAuthUser(id);
	}
});

async function createSaison() {
	const data = await crudSaison.create({
		name: `test-${uid()}`,
		start_datum: "2026-01-01",
		end_datum: "2026-12-31",
	});
	createdIds.tb_saison.push(data.id);
	return data;
}

async function createStandort() {
	const data = await crudStandort.create({
		plz: 12345,
		ort: `Testort-${uid()}`,
		adresse: "Teststr. 1",
	});
	createdIds.tb_standort.push(data.id);
	return data;
}

async function createStand(standortId: string) {
	const data = await crudStand.create({
		standort_id: standortId,
		bezeichnung: `test-${uid()}`,
	});
	createdIds.tb_stand.push(data.id);
	return data;
}

async function createProdukt() {
	const data = await crudProdukt.create({
		art: "Baum",
		bezeichnung: `test-${uid()}`,
		von_cm: 100,
		bis_cm: 150,
	});
	createdIds.tb_produkt.push(data.id);
	return data;
}

async function createProfil() {
	return { id: sharedProfilId };
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_verkauf RPC", () => {
	it("creates verkauf with 2 positions atomically", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await getClient().rpc(
			"create_verkauf_mit_positionen",
			{
				p_verkauf: {
					saison_id: saison.id,
					stand_id: stand.id,
					profil_id: profil.id,
					aktion_bz: null,
					preis_gesamt: 45.0,
					anmerkung: null,
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 1,
						einzelpreis: 25.0,
						kreuz_montiert: false,
						hoehe_cm: 120,
					},
					{
						produkt_id: produkt.id,
						menge: 2,
						einzelpreis: 10.0,
						kreuz_montiert: true,
						hoehe_cm: 80,
					},
				],
			},
		);

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		// Verify header exists
		const { data: header } = await getClient()
			.from("tb_verkauf")
			.select("*")
			.eq("id", data!.id)
			.single();
		expect(header?.preis_gesamt).toBe(45.0);

		// Verify 2 positions created
		const { data: pos } = await getClient()
			.from("tb_position")
			.select("*")
			.eq("verkauf_id", data!.id);
		expect(pos?.length).toBe(2);

		// Cleanup
		createdIds.tb_verkauf.push(data!.id);
		for (const p of pos || []) {
			createdIds.tb_position.push(p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await getClient().rpc(
			"create_verkauf_mit_positionen",
			{
				p_verkauf: {
					saison_id: saison.id,
					stand_id: stand.id,
					profil_id: profil.id,
					preis_gesamt: 10.0,
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 0,
						einzelpreis: 10.0,
						kreuz_montiert: false,
						hoehe_cm: 100,
					},
				],
			},
		);

		// Should fail - menge > 0 constraint in DB
		expect(error).not.toBeNull();
		expect(data).toBeNull();

		// Verify the header insert was rolled back (atomicity). saison.id is unique
		// to this test, so no tb_verkauf row should reference it.
		const { data: headers } = await getClient()
			.from("tb_verkauf")
			.select("id")
			.eq("saison_id", saison.id);
		expect(headers).toEqual([]);
	});
});
