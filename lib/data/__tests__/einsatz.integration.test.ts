// @vitest-environment node
import { describe, expect, it } from "vitest";
import { einsatzInsertSchema } from "@/lib/schemas/einsatz";
import { createFixtures, createTestCrud, hasSupabase } from "./test-utils";

const crudEinsatz = createTestCrud({
	table: "tb_einsatz",
	insertSchema: einsatzInsertSchema,
	labels: { singular: "Einsatz", plural: "Einsätze" },
});

const fixtures = createFixtures();

async function createEinsatz(overrides: Partial<Record<string, unknown>> = {}) {
	const saison = await fixtures.createSaison();
	const stand = await fixtures.createStand();
	const profilId = await fixtures.getProfilId();

	const e = await crudEinsatz.create({
		saison_id: saison.id,
		stand_id: stand.id,
		profil_id: profilId,
		von: "2026-06-15",
		bis: null,
		...overrides,
	});
	fixtures.track("tb_einsatz", e.id);
	return e;
}

describe.skipIf(!hasSupabase)("tb_einsatz CRUD", () => {
	it("creates einsatz with given von", async () => {
		const e = await createEinsatz();
		expect(e.von).toBe("2026-06-15");
		expect(e.bis).toBeNull();
		expect(e.saison_id).toBeDefined();
		expect(e.stand_id).toBeDefined();
		expect(e.profil_id).toBeDefined();
	});

	it("creates einsatz with bis", async () => {
		const e = await createEinsatz({ bis: "2026-07-15" });
		expect(e.bis).toBe("2026-07-15");
	});

	it("reads all einsätze", async () => {
		const created = await createEinsatz();
		const all = await crudEinsatz.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates einsatz von", async () => {
		const e = await createEinsatz();
		const updated = await crudEinsatz.update(e.id, { von: "2026-07-01" });

		expect(updated.von).toBe("2026-07-01");
	});

	it("deletes einsatz", async () => {
		const e = await createEinsatz();
		await crudEinsatz.remove(e.id);
	});
});

describe.skipIf(!hasSupabase)("tb_einsatz by saison", () => {
	it("filters einsätze by saison_id", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const profilId = await fixtures.getProfilId();

		const e1 = await crudEinsatz.create({
			saison_id: saison.id,
			stand_id: stand.id,
			profil_id: profilId,
			von: "2026-06-15",
			bis: null,
		});
		fixtures.track("tb_einsatz", e1.id);

		const e2 = await crudEinsatz.create({
			saison_id: saison.id,
			stand_id: stand.id,
			profil_id: profilId,
			von: "2026-07-01",
			bis: "2026-07-15",
		});
		fixtures.track("tb_einsatz", e2.id);

		const data = await crudEinsatz.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([e1.id, e2.id].sort());
	});
});
