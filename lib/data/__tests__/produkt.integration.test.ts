// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import {
	produktCreateSchema,
	produktInsertSchema,
} from "@/lib/schemas/produkt";
import { createTestCrud, getClient, hasSupabase, uid } from "./test-utils";

const crud = createTestCrud({
	table: "tb_produkt",
	insertSchema: produktInsertSchema,
	createSchema: produktCreateSchema,
	labels: { singular: "Produkt", plural: "Produkte" },
	orderBy: { column: "bezeichnung" },
});

const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await getClient().from("tb_produkt").delete().in("id", createdIds);
	}
});

describe.skipIf(!hasSupabase)("tb_produkt CRUD", () => {
	it("creates produkt of art Baum", async () => {
		const produkt = await crud.create({
			art: "Baum",
			bezeichnung: `test-${uid()}`,
			von_cm: 100,
			bis_cm: 150,
		});
		createdIds.push(produkt.id);
		expect(produkt.art).toBe("Baum");
	});

	it("creates produkt of art Kreuz", async () => {
		const produkt = await crud.create({
			art: "Kreuz",
			bezeichnung: `test-${uid()}`,
			von_cm: 50,
			bis_cm: 80,
		});
		createdIds.push(produkt.id);
		expect(produkt.art).toBe("Kreuz");
	});

	it("rejects produkt with bis_cm < von_cm", async () => {
		await expect(
			crud.create({
				art: "Baum",
				bezeichnung: `test-${uid()}`,
				von_cm: 150,
				bis_cm: 100,
			}),
		).rejects.toThrow();
	});

	it("reads all produkte", async () => {
		const created = await crud.create({
			art: "Baum",
			bezeichnung: `test-${uid()}`,
			von_cm: 100,
			bis_cm: 150,
		});
		createdIds.push(created.id);
		const all = await crud.getAll();

		expect(all.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates produkt bezeichnung", async () => {
		const produkt = await crud.create({
			art: "Baum",
			bezeichnung: `test-${uid()}`,
			von_cm: 100,
			bis_cm: 150,
		});
		createdIds.push(produkt.id);
		const updated = await crud.update(produkt.id, {
			bezeichnung: `updated-${uid()}`,
		});

		expect(updated.bezeichnung).not.toBe(produkt.bezeichnung);
	});

	it("deletes produkt", async () => {
		const produkt = await crud.create({
			art: "Baum",
			bezeichnung: `test-${uid()}`,
			von_cm: 100,
			bis_cm: 150,
		});
		createdIds.push(produkt.id);
		await crud.remove(produkt.id);
	});
});
