// @vitest-environment node
import { describe, expect, it } from "vitest";
import { wareneingangInsertSchema } from "@/lib/schemas/wareneingang";
import {
	createFixtures,
	createTestCrud,
	getClient,
	hasSupabase,
} from "./test-utils";

const crudWareneingang = createTestCrud({
	table: "tb_wareneingang",
	insertSchema: wareneingangInsertSchema,
	labels: { singular: "Wareneingang", plural: "Wareneingaenge" },
});

const fixtures = createFixtures();

async function createWareneingang(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await fixtures.createSaison();
	const stand = await fixtures.createStand();
	const profilId = await fixtures.getProfilId();

	const we = await crudWareneingang.create({
		saison_id: saison.id,
		stand_id: stand.id,
		erfasst_von: profilId,
		datum: "2026-06-15",
		...overrides,
	});
	fixtures.track("tb_wareneingang", we.id);
	return we;
}

describe.skipIf(!hasSupabase)("tb_wareneingang CRUD", () => {
	it("creates wareneingang with given datum", async () => {
		const we = await createWareneingang();
		expect(we.datum).toBe("2026-06-15");
		expect(we.saison_id).toBeDefined();
		expect(we.stand_id).toBeDefined();
		expect(we.erfasst_von).toBeDefined();
	});

	it("creates wareneingang with custom datum", async () => {
		const we = await createWareneingang({ datum: "2026-07-01" });
		expect(we.datum).toBe("2026-07-01");
	});

	it("reads all wareneingaenge", async () => {
		const created = await createWareneingang();
		const all = await crudWareneingang.getAll();

		expect(all.some((r) => r.id === created.id)).toBe(true);
	});

	it("updates wareneingang datum", async () => {
		const we = await createWareneingang();
		const updated = await crudWareneingang.update(we.id, {
			datum: "2026-08-01",
		});

		expect(updated.datum).toBe("2026-08-01");
	});

	it("deletes wareneingang", async () => {
		const we = await createWareneingang();
		await crudWareneingang.remove(we.id);
	});
});

describe.skipIf(!hasSupabase)("tb_wareneingang by saison", () => {
	it("filters wareneingaenge by saison_id", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const profilId = await fixtures.getProfilId();

		const w1 = await crudWareneingang.create({
			saison_id: saison.id,
			stand_id: stand.id,
			erfasst_von: profilId,
			datum: "2026-06-15",
		});
		fixtures.track("tb_wareneingang", w1.id);

		const w2 = await crudWareneingang.create({
			saison_id: saison.id,
			stand_id: stand.id,
			erfasst_von: profilId,
			datum: "2026-07-01",
		});
		fixtures.track("tb_wareneingang", w2.id);

		const data = await crudWareneingang.getBySaisonId(saison.id);

		expect(data).toHaveLength(2);
		expect(data.map((r) => r.id).sort()).toEqual([w1.id, w2.id].sort());
	});
});

describe.skipIf(!hasSupabase)("tb_wareneingang RPC", () => {
	it("creates wareneingang with 2 positions atomically", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const produkt = await fixtures.createProdukt();
		const profilId = await fixtures.getProfilId();

		const { data, error } = await getClient().rpc(
			"create_wareneingang_mit_positionen",
			{
				p_wareneingang: {
					saison_id: saison.id,
					stand_id: stand.id,
					erfasst_von: profilId,
					datum: "2026-06-15",
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 10,
					},
					{
						produkt_id: produkt.id,
						menge: 5,
					},
				],
			},
		);

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		// Verify header exists
		const { data: header } = await getClient()
			.from("tb_wareneingang")
			.select("*")
			.eq("id", data!.id)
			.single();

		expect(header?.datum).toBe("2026-06-15");

		// Verify 2 positions created
		const { data: pos } = await getClient()
			.from("tb_wareneingangsposition")
			.select("*")
			.eq("wareneingang_id", data!.id);

		expect(pos?.length).toBe(2);

		// Cleanup
		fixtures.track("tb_wareneingang", data!.id);
		for (const p of pos || []) {
			fixtures.track("tb_wareneingangsposition", p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const produkt = await fixtures.createProdukt();
		const profilId = await fixtures.getProfilId();

		const { data, error } = await getClient().rpc(
			"create_wareneingang_mit_positionen",
			{
				p_wareneingang: {
					saison_id: saison.id,
					stand_id: stand.id,
					erfasst_von: profilId,
					datum: "2026-06-15",
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 0,
					},
				],
			},
		);

		// Should fail - menge > 0 CHECK constraint in DB
		expect(error).not.toBeNull();
		expect(data).toBeNull();

		// Verify the header insert was rolled back (atomicity). saison.id is unique
		// to this test, so no tb_wareneingang row should reference it.
		const { data: headers } = await getClient()
			.from("tb_wareneingang")
			.select("id")
			.eq("saison_id", saison.id);
		expect(headers).toEqual([]);
	});
});
