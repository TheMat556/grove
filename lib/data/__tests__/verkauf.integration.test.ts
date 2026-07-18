// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createFixtures, getClient, hasSupabase } from "./test-utils";

const fixtures = createFixtures();

describe.skipIf(!hasSupabase)("tb_verkauf RPC", () => {
	it("creates verkauf with 2 positions atomically", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const produkt = await fixtures.createProdukt();
		const profilId = await fixtures.getProfilId();

		const { data, error } = await getClient().rpc(
			"create_verkauf_mit_positionen",
			{
				p_verkauf: {
					saison_id: saison.id,
					stand_id: stand.id,
					profil_id: profilId,
					aktion_bz: null,
					preis_gesamt: 45.0,
					anmerkung: null,
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 1,
						einzelpreis: 25.0,
						kreuz_montiert: false,
						hoehe_cm: 120,
					},
					{
						produkt_id: produkt.id,
						menge: 2,
						einzelpreis: 10.0,
						kreuz_montiert: true,
						hoehe_cm: 80,
					},
				],
			},
		);

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		// Verify header exists
		const { data: header } = await getClient()
			.from("tb_verkauf")
			.select("*")
			.eq("id", data!.id)
			.single();
		expect(header?.preis_gesamt).toBe(45.0);

		// Verify 2 positions created
		const { data: pos } = await getClient()
			.from("tb_position")
			.select("*")
			.eq("verkauf_id", data!.id);
		expect(pos?.length).toBe(2);

		// Cleanup
		fixtures.track("tb_verkauf", data!.id);
		for (const p of pos || []) {
			fixtures.track("tb_position", p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await fixtures.createSaison();
		const stand = await fixtures.createStand();
		const produkt = await fixtures.createProdukt();
		const profilId = await fixtures.getProfilId();

		const { data, error } = await getClient().rpc(
			"create_verkauf_mit_positionen",
			{
				p_verkauf: {
					saison_id: saison.id,
					stand_id: stand.id,
					profil_id: profilId,
					preis_gesamt: 10.0,
				},
				p_positionen: [
					{
						produkt_id: produkt.id,
						menge: 0,
						einzelpreis: 10.0,
						kreuz_montiert: false,
						hoehe_cm: 100,
					},
				],
			},
		);

		// Should fail - menge > 0 constraint in DB
		expect(error).not.toBeNull();
		expect(data).toBeNull();

		// Verify the header insert was rolled back (atomicity). saison.id is unique
		// to this test, so no tb_verkauf row should reference it.
		const { data: headers } = await getClient()
			.from("tb_verkauf")
			.select("id")
			.eq("saison_id", saison.id);
		expect(headers).toEqual([]);
	});
});
