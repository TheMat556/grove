// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, create, update, remove } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/data/verkauf", () => ({
	createVerkaufMitPositionen: create,
	updateVerkaufMitPositionen: update,
	deleteVerkaufMitPositionen: remove,
}));

import {
	createVerkaufAction,
	deleteVerkaufAction,
	updateVerkaufAction,
	type VerkaufFormState,
} from "./actions";

const saisonId = "11111111-1111-4111-8111-111111111111";
const standId = "22222222-2222-4222-8222-222222222222";
const produktId = "33333333-3333-4333-8333-333333333333";
const verkaufId = "55555555-5555-4555-8555-555555555555";

function formData(overrides: Record<string, string> = {}) {
	const data = new FormData();
	data.set("saison_id", saisonId);
	data.set("stand_id", standId);
	data.set(
		"positionen",
		JSON.stringify([
			{
				produkt_id: produktId,
				menge: 2,
				einzelpreis: 25,
				kreuz_montiert: false,
				hoehe_cm: 150,
			},
			{
				produkt_id: produktId,
				menge: 1,
				einzelpreis: 19.9,
				kreuz_montiert: false,
				hoehe_cm: 120,
			},
		]),
	);
	for (const [key, value] of Object.entries(overrides)) data.set(key, value);
	return data;
}

describe("createVerkaufAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		create.mockResolvedValue({ id: "verkauf-1", stand_id: standId });
		update.mockResolvedValue({ id: verkaufId, stand_id: standId });
		remove.mockResolvedValue(undefined);
	});

	it("legt Verkauf mit berechnetem Gesamtpreis und Session-Feldern an", async () => {
		const state: VerkaufFormState = await createVerkaufAction({}, formData());

		expect(state).toEqual({
			success: true,
			verkauf: { id: "verkauf-1", stand_id: standId },
			positionen: expect.any(Array),
		});
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				saison_id: saisonId,
				stand_id: standId,
				reservierung_id: null,
				aktion_bz: null,
				anmerkung: null,
				preis_gesamt: 69.9,
			}),
			expect.arrayContaining([
				expect.objectContaining({ produkt_id: produktId }),
			]),
		);
		expect(revalidatePath).toHaveBeenCalledWith("/protected/verkaeufe");
	});

	it("rechnet den Gesamtpreis serverseitig, Client-Wert ist irrelevant", async () => {
		const data = formData({ preis_gesamt: "1" });
		await createVerkaufAction({}, data);

		const kopf = create.mock.calls[0][0];
		expect(kopf.preis_gesamt).toBe(69.9);
	});

	it("ohne Positionen: Fehler, kein DB-Aufruf", async () => {
		const state = await createVerkaufAction({}, formData({ positionen: "[]" }));

		expect(state.errors?.positionen).toBeDefined();
		expect(create).not.toHaveBeenCalled();
	});

	it("ungültige Menge: Fehler, kein DB-Aufruf", async () => {
		const state = await createVerkaufAction(
			{},
			formData({
				positionen: JSON.stringify([
					{
						produkt_id: produktId,
						menge: 0,
						einzelpreis: 10,
						kreuz_montiert: false,
						hoehe_cm: 100,
					},
				]),
			}),
		);

		expect(state.errors?.positionen?.[0]).toMatch(/Menge/);
		expect(create).not.toHaveBeenCalled();
	});

	it("Datenfehler wird als Meldung zurückgegeben", async () => {
		create.mockRejectedValue(
			new Error("Verkauf konnte nicht angelegt werden: kaputt"),
		);

		const state = await createVerkaufAction({}, formData());

		expect(state.message).toContain("kaputt");
		expect(state.success).toBeUndefined();
	});
});

describe("updateVerkaufAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		update.mockResolvedValue({ id: verkaufId, stand_id: standId });
	});

	it("aktualisiert Kopf und ersetzt Positionen", async () => {
		const state: VerkaufFormState = await updateVerkaufAction(
			{},
			formData({ id: verkaufId, anmerkung: "Nachgebessert" }),
		);

		expect(state).toEqual({
			success: true,
			verkauf: { id: verkaufId, stand_id: standId },
			positionen: expect.any(Array),
		});
		expect(update).toHaveBeenCalledWith(
			verkaufId,
			expect.objectContaining({
				stand_id: standId,
				anmerkung: "Nachgebessert",
			}),
			expect.arrayContaining([
				expect.objectContaining({ produkt_id: produktId }),
			]),
		);
		expect(revalidatePath).toHaveBeenCalledWith("/protected/verkaeufe");
	});

	it("ohne ID: Meldung, kein DB-Aufruf", async () => {
		const state = await updateVerkaufAction({}, formData());

		expect(state.message).toBeDefined();
		expect(update).not.toHaveBeenCalled();
	});
});

describe("deleteVerkaufAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		remove.mockResolvedValue(undefined);
	});

	it("löscht Verkauf samt Positionen", async () => {
		const data = new FormData();
		data.set("id", verkaufId);

		await deleteVerkaufAction(data);

		expect(remove).toHaveBeenCalledWith(verkaufId);
		expect(revalidatePath).toHaveBeenCalledWith("/protected/verkaeufe");
	});

	it("ignoriert ungültige ID", async () => {
		const data = new FormData();
		data.set("id", "kaputt");

		await deleteVerkaufAction(data);

		expect(remove).not.toHaveBeenCalled();
	});
});
