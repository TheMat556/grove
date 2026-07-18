// @vitest-environment node
import { describe, expect, it } from "vitest";
import { standInsertSchema } from "@/lib/schemas/stand";
import { createFixtures, createTestCrud, hasSupabase } from "./test-utils";

const fixtures = createFixtures();
const crudStand = createTestCrud({
	table: "tb_stand",
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
});

describe.skipIf(!hasSupabase)("tb_stand CRUD", () => {
	it("creates stand with given bezeichnung", async () => {
		const stand = await fixtures.createStand();
		expect(stand.bezeichnung).toMatch(/^test-/);
		expect(stand.standort_id).toBeDefined();
	});

	it("reads all stände", async () => {
		const created = await fixtures.createStand();
		const all = await crudStand.getAll();

		expect(all.some((s: { id: string }) => s.id === created.id)).toBe(true);
	});

	it("updates stand bezeichnung", async () => {
		const stand = await fixtures.createStand();
		const updated = await crudStand.update(stand.id, {
			bezeichnung: `updated-${Math.random().toString(36).slice(2, 8)}`,
		});

		expect(updated.bezeichnung).not.toBe(stand.bezeichnung);
	});

	it("deletes stand", async () => {
		const stand = await fixtures.createStand();
		await crudStand.remove(stand.id);
	});
});
