// @vitest-environment node
import { describe, expect, it } from "vitest";
import { preisempfehlungInsertSchema } from "@/lib/schemas/preisempfehlung";
import { createFixtures, createTestCrud, hasSupabase } from "./test-utils";

const crudPreisempfehlung = createTestCrud({
	table: "tb_preisempfehlung",
	insertSchema: preisempfehlungInsertSchema,
	labels: { singular: "Preisempfehlung", plural: "Preisempfehlungen" },
});

const fixtures = createFixtures();

async function createPreisempfehlung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await fixtures.createSaison();
	const produkt = await fixtures.createProdukt();
	const pe = await crudPreisempfehlung.create({
		saison_id: saison.id,
		produkt_id: produkt.id,
		preis: 19.99,
		...overrides,
	});
	fixtures.track("tb_preisempfehlung", pe.id);
	return pe;
}

describe.skipIf(!hasSupabase)("tb_preisempfehlung CRUD", () => {
	it("creates preisempfehlung with given preis", async () => {
		const pe = await createPreisempfehlung();
		expect(pe.preis).toBe(19.99);
		expect(pe.saison_id).toBeDefined();
		expect(pe.produkt_id).toBeDefined();
	});

	it("reads all preisempfehlungen", async () => {
		const created = await createPreisempfehlung();
		const all = await crudPreisempfehlung.getAll();

		expect(all.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates preisempfehlung preis", async () => {
		const pe = await createPreisempfehlung();
		const updated = await crudPreisempfehlung.update(pe.id, { preis: 29.99 });

		expect(updated.preis).toBe(29.99);
	});

	it("deletes preisempfehlung", async () => {
		const pe = await createPreisempfehlung();
		await crudPreisempfehlung.remove(pe.id);
	});
});

describe.skipIf(!hasSupabase)("tb_preisempfehlung by saison", () => {
	it("filters preisempfehlungen by saison_id", async () => {
		const saison = await fixtures.createSaison();
		const produkt1 = await fixtures.createProdukt();
		const produkt2 = await fixtures.createProdukt();

		const pe1 = await crudPreisempfehlung.create({
			saison_id: saison.id,
			produkt_id: produkt1.id,
			preis: 9.99,
		});
		fixtures.track("tb_preisempfehlung", pe1.id);

		const pe2 = await crudPreisempfehlung.create({
			saison_id: saison.id,
			produkt_id: produkt2.id,
			preis: 14.99,
		});
		fixtures.track("tb_preisempfehlung", pe2.id);

		const data = await crudPreisempfehlung.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((p) => p.id).sort()).toEqual([pe1.id, pe2.id].sort());
	});
});
