// @vitest-environment node
import { describe, expect, it } from "vitest";
import { inventurInsertSchema } from "@/lib/schemas/inventur";
import { createFixtures, createTestCrud, hasSupabase } from "./test-utils";

const crudInventur = createTestCrud({
	table: "tb_inventur",
	insertSchema: inventurInsertSchema,
	labels: { singular: "Inventur", plural: "Inventuren" },
});

const fixtures = createFixtures();

async function createInventur(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await fixtures.createSaison();
	const stand = await fixtures.createStand();
	const produkt = await fixtures.createProdukt();
	const profilId = await fixtures.getProfilId();

	const inv = await crudInventur.create({
		saison_id: saison.id,
		stand_id: stand.id,
		produkt_id: produkt.id,
		profil_id: profilId,
		datum: "2026-06-15",
		differenz: 5,
		grund: null,
		...overrides,
	});
	fixtures.track("tb_inventur", inv.id);
	return inv;
}

describe.skipIf(!hasSupabase)("tb_inventur CRUD", () => {
	it("creates inventur with given differenz", async () => {
		const inv = await createInventur();
		expect(inv.differenz).toBe(5);
		expect(inv.datum).toBe("2026-06-15");
		expect(inv.saison_id).toBeDefined();
		expect(inv.stand_id).toBeDefined();
		expect(inv.produkt_id).toBeDefined();
		expect(inv.profil_id).toBeDefined();
	});

	it("creates inventur with grund", async () => {
		const inv = await createInventur({ grund: "Zählt differenz" });
		expect(inv.grund).toBe("Zählt differenz");
	});

	it("reads all inventuren", async () => {
		const created = await createInventur();
		const all = await crudInventur.getAll();

		expect(all.some((i) => i.id === created.id)).toBe(true);
	});

	it("updates inventur differenz", async () => {
		const inv = await createInventur();
		const updated = await crudInventur.update(inv.id, { differenz: -3 });

		expect(updated.differenz).toBe(-3);
	});

	it("deletes inventur", async () => {
		const inv = await createInventur();
		await crudInventur.remove(inv.id);
	});
});

describe.skipIf(!hasSupabase)("tb_inventur by saison", () => {
	it("filters inventuren by saison_id", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const produkt = await fixtures.createProdukt();
		const profilId = await fixtures.getProfilId();

		const i1 = await crudInventur.create({
			saison_id: saison.id,
			stand_id: stand.id,
			produkt_id: produkt.id,
			profil_id: profilId,
			datum: "2026-06-15",
			differenz: 5,
			grund: null,
		});
		fixtures.track("tb_inventur", i1.id);

		const i2 = await crudInventur.create({
			saison_id: saison.id,
			stand_id: stand.id,
			produkt_id: produkt.id,
			profil_id: profilId,
			datum: "2026-07-01",
			differenz: -2,
			grund: "Retoure",
		});
		fixtures.track("tb_inventur", i2.id);

		const data = await crudInventur.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((i) => i.id).sort()).toEqual([i1.id, i2.id].sort());
	});
});
