// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestCrud, getClient } from "./test-utils";
import { standortInsertSchema } from "@/lib/schemas/standort";
import { standInsertSchema } from "@/lib/schemas/stand";
import { saisonInsertSchema } from "@/lib/schemas/saison";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

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

const crudSaison = createTestCrud({
	table: "tb_saison",
	insertSchema: saisonInsertSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});

const createdIds: { stand_id: string; saison_id: string }[] = [];
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];
const createdSaisonIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		// Delete junction rows first (FK constraint)
		for (let i = 0; i < createdIds.length; i++) {
			await getClient()
				.from("tb_stand_saison")
				.delete()
				.eq("stand_id", createdIds[i].stand_id)
				.eq("saison_id", createdIds[i].saison_id);
		}
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
});

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

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_stand_saison junction", () => {
	it("assigns a stand to a saison", async () => {
		const stand = await createStand();
		const saison = await createSaison();

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id })
			.select()
			.single();

		expect(error).toBeNull();
		expect(data).not.toBeNull();
		expect(data?.stand_id).toBe(stand.id);
		expect(data?.saison_id).toBe(saison.id);

		createdIds.push({ stand_id: stand.id, saison_id: saison.id });
	});

	it("reads all links for a given saison", async () => {
		const stand1 = await createStand();
		const stand2 = await createStand();
		const saison = await createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand1.id, saison_id: saison.id });
		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand2.id, saison_id: saison.id });

		createdIds.push(
			{ stand_id: stand1.id, saison_id: saison.id },
			{ stand_id: stand2.id, saison_id: saison.id },
		);

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.stand_id)).toEqual(
			expect.arrayContaining([stand1.id, stand2.id]),
		);
	});

	it("reads all links for a given stand", async () => {
		const stand = await createStand();
		const saison1 = await createSaison();
		const saison2 = await createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison1.id });
		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison2.id });

		createdIds.push(
			{ stand_id: stand.id, saison_id: saison1.id },
			{ stand_id: stand.id, saison_id: saison2.id },
		);

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("stand_id", stand.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.saison_id)).toEqual(
			expect.arrayContaining([saison1.id, saison2.id]),
		);
	});

	it("deletes a link between stand and saison", async () => {
		const stand = await createStand();
		const saison = await createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		const { error } = await getClient()
			.from("tb_stand_saison")
			.delete()
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);

		expect(error).toBeNull();

		// Verify deletion
		const { data } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);

		expect(data).toHaveLength(0);
	});

	it("prevents duplicate links (composite PK constraint)", async () => {
		const stand = await createStand();
		const saison = await createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		createdIds.push({ stand_id: stand.id, saison_id: saison.id });

		const { error } = await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		expect(error).not.toBeNull();
	});
});
