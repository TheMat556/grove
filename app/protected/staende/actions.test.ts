// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// "use server"-Dateien ziehen next/cache und next/navigation rein – Stubs statt
// laufendem Next-Server. Datenfunktionen gemockt, damit kein Supabase nötig ist.
const { revalidatePath, data } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	data: {
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
	},
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/session", () => ({
	getCurrentProfilId: vi.fn().mockResolvedValue("profil-1"),
}));
vi.mock("@/lib/data/stand", () => ({
	createStandMitStandort: data.create,
	updateStandMitStandort: data.update,
	deleteStandMitStandort: data.remove,
}));

import {
	createStandAction,
	type StandFormState,
	updateStandAction,
} from "./actions";

function formMitWerten(werte: Record<string, string>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(werte)) {
		formData.set(key, value);
	}
	return formData;
}

const basis = {
	bezeichnung: "Obst & Gemüse",
	plz: "1234",
	ort: "Wien",
	adresse: "Hauptplatz 1",
};

describe("staende actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		data.create.mockResolvedValue({});
		data.update.mockResolvedValue(undefined);
		data.remove.mockResolvedValue(undefined);
	});

	it("create: gültiges Formular legt Stand inkl. Standort an (PLZ als Zahl)", async () => {
		const state: StandFormState = await createStandAction(
			{},
			formMitWerten(basis),
		);

		expect(state).toEqual({ success: true });
		expect(data.create).toHaveBeenCalledWith({
			bezeichnung: "Obst & Gemüse",
			plz: 1234,
			ort: "Wien",
			adresse: "Hauptplatz 1",
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/staende");
	});

	it("create: leere Bezeichnung ist ein Feldfehler, kein DB-Aufruf", async () => {
		const state = await createStandAction(
			{},
			formMitWerten({ ...basis, bezeichnung: "" }),
		);

		expect(state.errors?.bezeichnung).toBeDefined();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("create: leere PLZ ist ein Feldfehler, keine stille 0", async () => {
		const state = await createStandAction(
			{},
			formMitWerten({ ...basis, plz: "" }),
		);

		expect(state.errors?.plz).toBeDefined();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("update: gültiges Formular aktualisiert Stand und Standort", async () => {
		const state = await updateStandAction(
			{},
			formMitWerten({ id: "stand-1", ...basis, ort: "Graz" }),
		);

		expect(state).toEqual({ success: true });
		expect(data.update).toHaveBeenCalledWith("stand-1", {
			bezeichnung: "Obst & Gemüse",
			plz: 1234,
			ort: "Graz",
			adresse: "Hauptplatz 1",
		});
	});
});
