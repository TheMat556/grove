// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_saison").delete().in("id", createdIds);
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
	createdIds.push(data.id);
	return data;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_saison CRUD", () => {
	it("creates saison with active=false by default", async () => {
		const saison = await createSaison();
		expect(saison.active).toBe(false);
	});

	it("creates saison with active=true", async () => {
		const saison = await createSaison({ active: true });
		expect(saison.active).toBe(true);
	});

	it("reads all saisons", async () => {
		const created = await createSaison();
		const { data, error } = await supabase.from("tb_saison").select("*");

		expect(error).toBeNull();
		// Auf die selbst angelegte Zeile prüfen statt auf globalen Zählerstand,
		// damit der Test nicht von anderen Tests / geteiltem DB-Zustand abhängt.
		expect(data?.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates saison name", async () => {
		const saison = await createSaison();
		const { data, error } = await supabase
			.from("tb_saison")
			.update({ name: `updated-${uid()}` })
			.eq("id", saison.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.name).not.toBe(saison.name);
	});

	it("deletes saison", async () => {
		const saison = await createSaison();
		const { error } = await supabase
			.from("tb_saison")
			.delete()
			.eq("id", saison.id);

		expect(error).toBeNull();
	});
});

describe.skipIf(!hasSupabase)("tb_saison active trigger", () => {
	it("sets a saison active", async () => {
		const saison = await createSaison();
		const { data, error } = await supabase
			.from("tb_saison")
			.update({ active: true })
			.eq("id", saison.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.active).toBe(true);
	});

	it("deactivates previously active saison when new one is activated", async () => {
		const s1 = await createSaison();
		const s2 = await createSaison();

		await supabase.from("tb_saison").update({ active: true }).eq("id", s1.id);

		await supabase.from("tb_saison").update({ active: true }).eq("id", s2.id);

		const { data: s1after } = await supabase
			.from("tb_saison")
			.select("active")
			.eq("id", s1.id)
			.single();

		const { data: s2after } = await supabase
			.from("tb_saison")
			.select("active")
			.eq("id", s2.id)
			.single();

		expect(s1after?.active).toBe(false);
		expect(s2after?.active).toBe(true);
	});

	it("allows same saison to stay active on re-activation", async () => {
		const saison = await createSaison();

		await supabase
			.from("tb_saison")
			.update({ active: true })
			.eq("id", saison.id);

		await supabase
			.from("tb_saison")
			.update({ active: true })
			.eq("id", saison.id);

		const { data } = await supabase
			.from("tb_saison")
			.select("active")
			.eq("id", saison.id)
			.single();

		expect(data?.active).toBe(true);
	});
});
