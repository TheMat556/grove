// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// Unterste Ebene mocken: createCrud liefert die Tabellen-Funktionen, das
// Standort-Modul die zweite Tabelle – getestet wird die Komposition in stand.ts.
const { crud, standort } = vi.hoisted(() => ({
	crud: {
		getAll: vi.fn(),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
	},
	standort: {
		createStandort: vi.fn(),
		getStandorte: vi.fn(),
		updateStandort: vi.fn(),
		deleteStandort: vi.fn(),
	},
}));

vi.mock("@/lib/data/crud", () => ({ createCrud: () => crud }));
vi.mock("@/lib/data/standort", () => standort);

import {
	createStandMitStandort,
	deleteStandMitStandort,
	getStaendeMitStandort,
	updateStandMitStandort,
} from "./stand";

const standortRow = {
	id: "standort-1",
	plz: 1234,
	ort: "Wien",
	adresse: "Hauptplatz 1",
};

const standRow = {
	id: "stand-1",
	standort_id: "standort-1",
	bezeichnung: "Obst & Gemüse",
};

const input = {
	bezeichnung: "Obst & Gemüse",
	plz: 1234,
	ort: "Wien",
	adresse: "Hauptplatz 1",
};

describe("getStaendeMitStandort", () => {
	it("verknüpft jeden Stand mit seinem Standort", async () => {
		crud.getAll.mockResolvedValue([standRow]);
		standort.getStandorte.mockResolvedValue([standortRow]);

		await expect(getStaendeMitStandort()).resolves.toEqual([
			{ ...standRow, standort: standortRow },
		]);
	});

	it("liefert standort: null, wenn die Standort-Zeile fehlt", async () => {
		crud.getAll.mockResolvedValue([standRow]);
		standort.getStandorte.mockResolvedValue([]);

		await expect(getStaendeMitStandort()).resolves.toEqual([
			{ ...standRow, standort: null },
		]);
	});

	it("behält die Stände, wenn die Standort-Abfrage scheitert", async () => {
		crud.getAll.mockResolvedValue([standRow]);
		standort.getStandorte.mockRejectedValue(new Error("DB kaputt"));

		await expect(getStaendeMitStandort()).resolves.toEqual([
			{ ...standRow, standort: null },
		]);
	});
});

describe("createStandMitStandort", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("legt zuerst den Standort an, dann den Stand mit dessen id", async () => {
		standort.createStandort.mockResolvedValue(standortRow);
		crud.create.mockResolvedValue(standRow);

		await expect(createStandMitStandort(input)).resolves.toEqual(standRow);

		expect(standort.createStandort).toHaveBeenCalledWith({
			plz: 1234,
			ort: "Wien",
			adresse: "Hauptplatz 1",
		});
		expect(crud.create).toHaveBeenCalledWith({
			standort_id: "standort-1",
			bezeichnung: "Obst & Gemüse",
		});
	});

	it("entfernt den angelegten Standort wieder, wenn der Stand scheitert", async () => {
		standort.createStandort.mockResolvedValue(standortRow);
		crud.create.mockRejectedValue(new Error("DB kaputt"));
		standort.deleteStandort.mockResolvedValue(undefined);

		await expect(createStandMitStandort(input)).rejects.toThrow("DB kaputt");
		expect(standort.deleteStandort).toHaveBeenCalledWith("standort-1");
	});
});

describe("updateStandMitStandort", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("aktualisiert Standort und Stand", async () => {
		crud.getById.mockResolvedValue(standRow);
		standort.updateStandort.mockResolvedValue(standortRow);
		crud.update.mockResolvedValue(standRow);

		await updateStandMitStandort("stand-1", { ...input, ort: "Graz" });

		expect(standort.updateStandort).toHaveBeenCalledWith("standort-1", {
			plz: 1234,
			ort: "Graz",
			adresse: "Hauptplatz 1",
		});
		expect(crud.update).toHaveBeenCalledWith("stand-1", {
			bezeichnung: "Obst & Gemüse",
		});
	});

	it("schreibt nichts, wenn der Stand nicht existiert", async () => {
		crud.getById.mockResolvedValue(null);

		await expect(updateStandMitStandort("fehlt", input)).rejects.toThrow(
			"Stand nicht gefunden.",
		);
		expect(standort.updateStandort).not.toHaveBeenCalled();
		expect(crud.update).not.toHaveBeenCalled();
	});
});

describe("deleteStandMitStandort", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("löscht Stand und Standort", async () => {
		crud.getById.mockResolvedValue(standRow);
		crud.remove.mockResolvedValue(undefined);
		standort.deleteStandort.mockResolvedValue(undefined);

		await deleteStandMitStandort("stand-1");

		expect(crud.remove).toHaveBeenCalledWith("stand-1");
		expect(standort.deleteStandort).toHaveBeenCalledWith("standort-1");
	});

	it("lässt den Standort stehen, wenn ihn noch ein anderer Stand nutzt", async () => {
		crud.getById.mockResolvedValue(standRow);
		crud.remove.mockResolvedValue(undefined);
		standort.deleteStandort.mockRejectedValue(new Error("FK-Verstoß"));

		await expect(deleteStandMitStandort("stand-1")).resolves.toBeUndefined();
		expect(crud.remove).toHaveBeenCalledWith("stand-1");
	});
});
