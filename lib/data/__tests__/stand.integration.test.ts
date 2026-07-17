// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestCrud, getClient } from "./test-utils";
import { standInsertSchema } from "@/lib/schemas/stand";
import { standortInsertSchema } from "@/lib/schemas/standort";

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

const createdIds: string[] = [];
const createdStandortIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await getClient().from("tb_stand").delete().in("id", createdIds);
	}
	if (createdStandortIds.length > 0) {
		await getClient().from("tb_standort").delete().in("id", createdStandortIds);
	}
});

async function createStandort(overrides: Partial<Record<string, unknown>> = {}) {
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
	createdIds.push(stand.id);
	return stand;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_stand CRUD", () => {
	it("creates stand with given bezeichnung", async () => {
		const stand = await createStand();
		expect(stand.bezeichnung).toMatch(/^test-/);
		expect(stand.standort_id).toBeDefined();
	});

	it("reads all stände", async () => {
		const created = await createStand();
		const all = await crudStand.getAll();

		expect(all.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates stand bezeichnung", async () => {
		const stand = await createStand();
		const updated = await crudStand.update(stand.id, {
			bezeichnung: `updated-${uid()}`,
		});

		expect(updated.bezeichnung).not.toBe(stand.bezeichnung);
	});

	it("deletes stand", async () => {
		const stand = await createStand();
		await crudStand.remove(stand.id);
	});
});
