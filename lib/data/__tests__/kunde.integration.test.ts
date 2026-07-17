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
		await supabase.from("tb_kunde").delete().in("id", createdIds);
	}
});

async function createKunde(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_kunde")
		.insert({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1, 12345 Stadt`,
			ist_firma: false,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdIds.push(data.id);
	return data;
}

describe("tb_kunde CRUD", () => {
	it("creates kunde with ist_firma=false by default", async () => {
		const kunde = await createKunde();
		expect(kunde.ist_firma).toBe(false);
	});

	it("creates kunde with ist_firma=true", async () => {
		const kunde = await createKunde({ ist_firma: true });
		expect(kunde.ist_firma).toBe(true);
	});

	it("reads all kunden", async () => {
		const created = await createKunde();
		const { data, error } = await supabase.from("tb_kunde").select("*");

		expect(error).toBeNull();
		expect(data?.some((k) => k.id === created.id)).toBe(true);
	});

	it("updates kunde name", async () => {
		const kunde = await createKunde();
		const { data, error } = await supabase
			.from("tb_kunde")
			.update({ name: `updated-${uid()}` })
			.eq("id", kunde.id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.name).not.toBe(kunde.name);
	});

	it("deletes kunde", async () => {
		const kunde = await createKunde();
		const { error } = await supabase
			.from("tb_kunde")
			.delete()
			.eq("id", kunde.id);

		expect(error).toBeNull();
	});
});
