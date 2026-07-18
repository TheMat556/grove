// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { createTestCrud, getClient, hasSupabase, uid } from "./test-utils";

const crud = createTestCrud({
	table: "tb_saison",
	insertSchema: saisonInsertSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});

const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await getClient().from("tb_saison").delete().in("id", createdIds);
	}
});

describe.skipIf(!hasSupabase)("tb_saison CRUD", () => {
	it("creates saison with active=false by default", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(saison.id);
		expect(saison.active).toBe(false);
	});

	it("creates saison with active=true", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
			active: true,
		});
		createdIds.push(saison.id);
		expect(saison.active).toBe(true);
	});

	it("reads all saisons", async () => {
		const created = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(created.id);
		const all = await crud.getAll();

		expect(all.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates saison name", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(saison.id);
		const updated = await crud.update(saison.id, { name: `updated-${uid()}` });

		expect(updated.name).not.toBe(saison.name);
	});

	it("deletes saison", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(saison.id);
		await crud.remove(saison.id);
	});
});

describe.skipIf(!hasSupabase)("tb_saison active trigger", () => {
	it("sets a saison active", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(saison.id);
		const updated = await crud.update(saison.id, { active: true });

		expect(updated.active).toBe(true);
	});

	it("deactivates previously active saison when new one is activated", async () => {
		const s1 = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(s1.id);
		const s2 = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(s2.id);

		const s1active = await crud.update(s1.id, { active: true });
		expect(s1active.active).toBe(true);

		await crud.update(s2.id, { active: true });

		const s1after = await crud.getById(s1.id);
		const s2after = await crud.getById(s2.id);

		expect(s1after?.active).toBe(false);
		expect(s2after?.active).toBe(true);
	});

	it("allows same saison to stay active on re-activation", async () => {
		const saison = await crud.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
		});
		createdIds.push(saison.id);

		await crud.update(saison.id, { active: true });
		await crud.update(saison.id, { active: true });

		const data = await crud.getById(saison.id);
		expect(data?.active).toBe(true);
	});
});
