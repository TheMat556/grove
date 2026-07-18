// @vitest-environment node
import { describe, expect, it } from "vitest";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";
import { createFixtures, createTestCrud, hasSupabase } from "./test-utils";

const crudReservierung = createTestCrud({
	table: "tb_reservierung",
	insertSchema: reservierungInsertSchema,
	labels: { singular: "Reservierung", plural: "Reservierungen" },
});

const fixtures = createFixtures();

async function createReservierung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await fixtures.createSaison();
	const stand = await fixtures.createStand();
	const kunde = await fixtures.createKunde();
	const profilId = await fixtures.getProfilId();

	const r = await crudReservierung.create({
		saison_id: saison.id,
		stand_id: stand.id,
		kunde_id: kunde.id,
		profil_id: profilId,
		versandart: "abholung",
		geplantes_datum: "2026-06-15",
		...overrides,
	});
	fixtures.track("tb_reservierung", r.id);
	return r;
}

describe.skipIf(!hasSupabase)("tb_reservierung CRUD", () => {
	it("creates reservierung with given values", async () => {
		const r = await createReservierung();
		expect(r.versandart).toBe("abholung");
		expect(r.geplantes_datum).toBe("2026-06-15");
		expect(r.status).toBe("offen");
		expect(r.saison_id).toBeDefined();
		expect(r.stand_id).toBeDefined();
		expect(r.kunde_id).toBeDefined();
		expect(r.profil_id).toBeDefined();
	});

	it("reads all reservierungen", async () => {
		const created = await createReservierung();
		const all = await crudReservierung.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates reservierung versandart", async () => {
		const r = await createReservierung();
		const updated = await crudReservierung.update(r.id, {
			versandart: "lieferung",
		});

		expect(updated.versandart).toBe("lieferung");
	});

	it("deletes reservierung", async () => {
		const r = await createReservierung();
		await crudReservierung.remove(r.id);
	});
});

describe.skipIf(!hasSupabase)("tb_reservierung by saison", () => {
	it("filters reservierungen by saison_id", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const kunde = await fixtures.createKunde();
		const profilId = await fixtures.getProfilId();

		const r1 = await crudReservierung.create({
			saison_id: saison.id,
			stand_id: stand.id,
			kunde_id: kunde.id,
			profil_id: profilId,
			versandart: "abholung",
			geplantes_datum: "2026-07-01",
		});
		fixtures.track("tb_reservierung", r1.id);

		const r2 = await crudReservierung.create({
			saison_id: saison.id,
			stand_id: stand.id,
			kunde_id: kunde.id,
			profil_id: profilId,
			versandart: "lieferung",
			geplantes_datum: "2026-07-15",
		});
		fixtures.track("tb_reservierung", r2.id);

		const data = await crudReservierung.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([r1.id, r2.id].sort());
	});
});
