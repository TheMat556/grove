// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createFixtures, getClient, hasSupabase } from "./test-utils";

const fixtures = createFixtures();

describe.skipIf(!hasSupabase)("tb_stand_saison junction", () => {
	it("assigns a stand to a saison", async () => {
		const stand = await fixtures.createStand();
		const saison = await fixtures.createSaison();

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id })
			.select()
			.single();

		expect(error).toBeNull();
		expect(data).not.toBeNull();
		expect(data?.stand_id).toBe(stand.id);
		expect(data?.saison_id).toBe(saison.id);

		fixtures.trackJunction(stand.id, saison.id);
	});

	it("reads all links for a given saison", async () => {
		const stand1 = await fixtures.createStand();
		const stand2 = await fixtures.createStand();
		const saison = await fixtures.createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand1.id, saison_id: saison.id });
		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand2.id, saison_id: saison.id });

		fixtures.trackJunction(stand1.id, saison.id);
		fixtures.trackJunction(stand2.id, saison.id);

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.stand_id)).toEqual(
			expect.arrayContaining([stand1.id, stand2.id]),
		);
	});

	it("reads all links for a given stand", async () => {
		const stand = await fixtures.createStand();
		const saison1 = await fixtures.createSaison();
		const saison2 = await fixtures.createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison1.id });
		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison2.id });

		fixtures.trackJunction(stand.id, saison1.id);
		fixtures.trackJunction(stand.id, saison2.id);

		const { data, error } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("stand_id", stand.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((r) => r.saison_id)).toEqual(
			expect.arrayContaining([saison1.id, saison2.id]),
		);
	});

	it("deletes a link between stand and saison", async () => {
		const stand = await fixtures.createStand();
		const saison = await fixtures.createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		const { error } = await getClient()
			.from("tb_stand_saison")
			.delete()
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);

		expect(error).toBeNull();

		// Verify deletion
		const { data } = await getClient()
			.from("tb_stand_saison")
			.select("*")
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);

		expect(data).toHaveLength(0);
	});

	it("prevents duplicate links (composite PK constraint)", async () => {
		const stand = await fixtures.createStand();
		const saison = await fixtures.createSaison();

		await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		fixtures.trackJunction(stand.id, saison.id);

		const { error } = await getClient()
			.from("tb_stand_saison")
			.insert({ stand_id: stand.id, saison_id: saison.id });

		expect(error).not.toBeNull();
	});
});
