// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: string[] = [];
const createdStandortIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_stand").delete().in("id", createdIds);
	}
	if (createdStandortIds.length > 0) {
		await supabase.from("tb_standort").delete().in("id", createdStandortIds);
	}
});

async function createStandort(
	overrides: Partial<Record<string, unknown>> = {},
) {
	const { data, error } = await supabase
		.from("tb_standort")
		.insert({
			ort: `test-${uid()}`,
			plz: 12345,
			adresse: `${uid()}-Straße 1`,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdStandortIds.push(data.id);
	return data;
}

async function createStand(overrides: Partial<Record<string, unknown>> = {}) {
	const standort = await createStandort();
	const { data, error } = await supabase
		.from("tb_stand")
		.insert({
			bezeichnung: `test-${uid()}`,
			standort_id: standort.id,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdIds.push(data.id);
	return data;
}

const hasSupabase = !!process.env.SUPABASE_TEST_URL;

describe.skipIf(!hasSupabase)("tb_stand CRUD", () => {
	it("creates stand with given bezeichnung", async () => {
		const stand = await createStand();
		expect(stand.bezeichnung).toMatch(/^test-/);
		expect(stand.standort_id).toBeDefined();
	});

	it("reads all stände", async () => {
		const created = await createStand();
		const { data, error } = await supabase.from("tb_stand").select("*");

		expect(error).toBeNull();
		expect(data?.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates stand bezeichnung", async () => {
		const stand = await createStand();
		const { data, error } = await supabase
			.from("tb_stand")
			.update({ bezeichnung: `updated-${uid()}` })
			.eq("id", stand.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.bezeichnung).not.toBe(stand.bezeichnung);
	});

	it("deletes stand", async () => {
		const stand = await createStand();
		const { error } = await supabase
			.from("tb_stand")
			.delete()
			.eq("id", stand.id);

		expect(error).toBeNull();
	});
});
