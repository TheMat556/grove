// @vitest-environment node

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { createTestProfil, deleteTestAuthUser } from "./test-utils";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

// Use service-role for test setup (bypasses auth)
const supabase = createClient<Database>(
	process.env.SUPABASE_TEST_URL!,
	process.env.SUPABASE_TEST_SERVICE_KEY!,
);

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
			await supabase.from(table).delete().in("id", ids);
		}
	}
	for (const id of createdAuthUserIds) {
		await deleteTestAuthUser(id);
	}
});

async function createSaison() {
	const { data } = await supabase
		.from("tb_saison")
		.insert({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		})
		.select()
		.single()
		.then((r) => {
			createdIds.tb_saison.push(r.data!.id);
			return r;
		});
	return data!;
}

async function createStandort() {
	const { data } = await supabase
		.from("tb_standort")
		.insert({
			plz: 12345,
			ort: `Testort-${uid()}`,
			adresse: "Teststr. 1",
		})
		.select()
		.single()
		.then((r) => {
			createdIds.tb_standort.push(r.data!.id);
			return r;
		});
	return data!;
}

async function createStand(standortId: string) {
	const { data } = await supabase
		.from("tb_stand")
		.insert({
			standort_id: standortId,
			bezeichnung: `test-${uid()}`,
		})
		.select()
		.single()
		.then((r) => {
			createdIds.tb_stand.push(r.data!.id);
			return r;
		});
	return data!;
}

async function createProdukt() {
	const { data } = await supabase
		.from("tb_produkt")
		.insert({
			art: "Baum",
			bezeichnung: `test-${uid()}`,
			von_cm: 100,
			bis_cm: 150,
		})
		.select()
		.single()
		.then((r) => {
			createdIds.tb_produkt.push(r.data!.id);
			return r;
		});
	return data!;
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

		const { data, error } = await supabase.rpc(
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
		const { data: header } = await supabase
			.from("tb_verkauf")
			.select("*")
			.eq("id", data!.id)
			.single();
		expect(header?.preis_gesamt).toBe(45.0);

		// Verify 2 positions created
		const { data: pos } = await supabase
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

		const { data, error } = await supabase.rpc(
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
	});
});
