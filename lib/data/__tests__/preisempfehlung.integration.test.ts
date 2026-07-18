// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { preisempfehlungInsertSchema } from "@/lib/schemas/preisempfehlung";
import { produktInsertSchema } from "@/lib/schemas/produkt";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { createTestCrud, getClient } from "./test-utils";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const crudSaison = createTestCrud({
	table: "tb_saison",
	insertSchema: saisonInsertSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});

const crudProdukt = createTestCrud({
	table: "tb_produkt",
	insertSchema: produktInsertSchema,
	labels: { singular: "Produkt", plural: "Produkte" },
});

const crudPreisempfehlung = createTestCrud({
	table: "tb_preisempfehlung",
	insertSchema: preisempfehlungInsertSchema,
	labels: { singular: "Preisempfehlung", plural: "Preisempfehlungen" },
});

const createdPreisempfehlungIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdProduktIds: string[] = [];

afterAll(async () => {
	if (createdPreisempfehlungIds.length > 0) {
		await getClient()
			.from("tb_preisempfehlung")
			.delete()
			.in("id", createdPreisempfehlungIds);
	}
	if (createdProduktIds.length > 0) {
		await getClient().from("tb_produkt").delete().in("id", createdProduktIds);
	}
	if (createdSaisonIds.length > 0) {
		await getClient().from("tb_saison").delete().in("id", createdSaisonIds);
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

async function createProdukt(overrides: Partial<Record<string, unknown>> = {}) {
	const produkt = await crudProdukt.create({
		bezeichnung: `test-${uid()}`,
		art: "Baum",
		von_cm: 0,
		bis_cm: 100,
		...overrides,
	});
	createdProduktIds.push(produkt.id);
	return produkt;
}

async function createPreisempfehlung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const produkt = await createProdukt();
	const pe = await crudPreisempfehlung.create({
		saison_id: saison.id,
		produkt_id: produkt.id,
		preis: 19.99,
		...overrides,
	});
	createdPreisempfehlungIds.push(pe.id);
	return pe;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

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
		const saison = await createSaison();
		const produkt1 = await createProdukt();
		const produkt2 = await createProdukt();

		const pe1 = await crudPreisempfehlung.create({
			saison_id: saison.id,
			produkt_id: produkt1.id,
			preis: 9.99,
		});
		createdPreisempfehlungIds.push(pe1.id);

		const pe2 = await crudPreisempfehlung.create({
			saison_id: saison.id,
			produkt_id: produkt2.id,
			preis: 14.99,
		});
		createdPreisempfehlungIds.push(pe2.id);

		const data = await crudPreisempfehlung.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((p) => p.id).sort()).toEqual([pe1.id, pe2.id].sort());
	});
});
