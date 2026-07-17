// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdPreisempfehlungIds: string[] = [];
const createdSaisonIds: string[] = [];
const createdProduktIds: string[] = [];

afterAll(async () => {
	if (createdPreisempfehlungIds.length > 0) {
		await supabase
			.from("tb_preisempfehlung")
			.delete()
			.in("id", createdPreisempfehlungIds);
	}
	if (createdProduktIds.length > 0) {
		await supabase.from("tb_produkt").delete().in("id", createdProduktIds);
	}
	if (createdSaisonIds.length > 0) {
		await supabase.from("tb_saison").delete().in("id", createdSaisonIds);
	}
});

async function createSaison(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_saison")
		.insert({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdSaisonIds.push(data.id);
	return data;
}

async function createProdukt(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_produkt")
		.insert({
			bezeichnung: `test-${uid()}`,
			art: "Baum",
			von_cm: 0,
			bis_cm: 100,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdProduktIds.push(data.id);
	return data;
}

async function createPreisempfehlung(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const saison = await createSaison();
	const produkt = await createProdukt();
	const { data, error } = await supabase
		.from("tb_preisempfehlung")
		.insert({
			saison_id: saison.id,
			produkt_id: produkt.id,
			preis: 19.99,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdPreisempfehlungIds.push(data.id);
	return data;
}

describe("tb_preisempfehlung CRUD", () => {
	it("creates preisempfehlung with given preis", async () => {
		const pe = await createPreisempfehlung();
		expect(pe.preis).toBe(19.99);
		expect(pe.saison_id).toBeDefined();
		expect(pe.produkt_id).toBeDefined();
	});

	it("reads all preisempfehlungen", async () => {
		const created = await createPreisempfehlung();
		const { data, error } = await supabase
			.from("tb_preisempfehlung")
			.select("*");

		expect(error).toBeNull();
		expect(data?.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates preisempfehlung preis", async () => {
		const pe = await createPreisempfehlung();
		const { data, error } = await supabase
			.from("tb_preisempfehlung")
			.update({ preis: 29.99 })
			.eq("id", pe.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.preis).toBe(29.99);
	});

	it("deletes preisempfehlung", async () => {
		const pe = await createPreisempfehlung();
		const { error } = await supabase
			.from("tb_preisempfehlung")
			.delete()
			.eq("id", pe.id);

		expect(error).toBeNull();
	});
});

describe("tb_preisempfehlung by saison", () => {
	it("filters preisempfehlungen by saison_id", async () => {
		const saison = await createSaison();
		const produkt1 = await createProdukt();
		const produkt2 = await createProdukt();

		const { data: pe1 } = await supabase
			.from("tb_preisempfehlung")
			.insert({
				saison_id: saison.id,
				produkt_id: produkt1.id,
				preis: 9.99,
			})
			.select()
			.single();

		const { data: pe2 } = await supabase
			.from("tb_preisempfehlung")
			.insert({
				saison_id: saison.id,
				produkt_id: produkt2.id,
				preis: 14.99,
			})
			.select()
			.single();

		if (pe1) createdPreisempfehlungIds.push(pe1.id);
		if (pe2) createdPreisempfehlungIds.push(pe2.id);

		const { data, error } = await supabase
			.from("tb_preisempfehlung")
			.select("*")
			.eq("saison_id", saison.id);

		expect(error).toBeNull();
		expect(data).toHaveLength(2);
		expect(data?.map((p) => p.id).sort()).toEqual([pe1?.id, pe2?.id].sort());
	});
});
