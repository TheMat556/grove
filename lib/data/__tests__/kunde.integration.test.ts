// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestCrud, getClient } from "./test-utils";
import { kundeInsertSchema } from "@/lib/schemas/kunde";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const crud = createTestCrud({
	table: "tb_kunde",
	insertSchema: kundeInsertSchema,
	labels: { singular: "Kunde", plural: "Kunden" },
});

const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await getClient().from("tb_kunde").delete().in("id", createdIds);
	}
});

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_kunde CRUD", () => {
	it("creates kunde with ist_firma=false by default", async () => {
		const kunde = await crud.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: false,
		});
		createdIds.push(kunde.id);
		expect(kunde.ist_firma).toBe(false);
	});

	it("creates kunde with ist_firma=true", async () => {
		const kunde = await crud.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: true,
		});
		createdIds.push(kunde.id);
		expect(kunde.ist_firma).toBe(true);
	});

	it("reads all kunden", async () => {
		const created = await crud.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: false,
		});
		createdIds.push(created.id);
		const all = await crud.getAll();

		expect(all.some((k) => k.id === created.id)).toBe(true);
	});

	it("updates kunde name", async () => {
		const kunde = await crud.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: false,
		});
		createdIds.push(kunde.id);
		const updated = await crud.update(kunde.id, { name: `updated-${uid()}` });

		expect(updated.name).not.toBe(kunde.name);
	});

	it("deletes kunde", async () => {
		const kunde = await crud.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: false,
		});
		createdIds.push(kunde.id);
		await crud.remove(kunde.id);
	});
});
