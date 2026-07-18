// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { standortInsertSchema } from "@/lib/schemas/standort";
import { createTestCrud, getClient, hasSupabase, uid } from "./test-utils";

const crud = createTestCrud({
	table: "tb_standort",
	insertSchema: standortInsertSchema,
	labels: { singular: "Standort", plural: "Standorte" },
	orderBy: { column: "ort" },
});

const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await getClient().from("tb_standort").delete().in("id", createdIds);
	}
});

describe.skipIf(!hasSupabase)("tb_standort CRUD", () => {
	it("creates standort", async () => {
		const standort = await crud.create({
			plz: 1234,
			ort: `Testort-${uid()}`,
			adresse: `${uid()}-Straße 1`,
		});
		createdIds.push(standort.id);
		expect(standort.plz).toBe(1234);
	});

	it("reads all standorte", async () => {
		const created = await crud.create({
			plz: 5432,
			ort: `Testort-${uid()}`,
			adresse: `${uid()}-Straße 2`,
		});
		createdIds.push(created.id);
		const all = await crud.getAll();

		expect(all.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates standort ort", async () => {
		const standort = await crud.create({
			plz: 1234,
			ort: `Testort-${uid()}`,
			adresse: `${uid()}-Straße 1`,
		});
		createdIds.push(standort.id);
		const updated = await crud.update(standort.id, { ort: `updated-${uid()}` });

		expect(updated.ort).not.toBe(standort.ort);
	});

	it("deletes standort", async () => {
		const standort = await crud.create({
			plz: 1234,
			ort: `Testort-${uid()}`,
			adresse: `${uid()}-Straße 1`,
		});
		createdIds.push(standort.id);
		await crud.remove(standort.id);
	});
});
