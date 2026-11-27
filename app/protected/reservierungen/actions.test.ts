// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// "use server"-Datei: Session + next/cache gestubbt, darunter der gemeinsame
// entity-actions-Factory-Pfad; die Datenfunktionen sind gemockt.
const { revalidatePath, data, createMitVerkauf, createKunde } = vi.hoisted(
	() => ({
		revalidatePath: vi.fn(),
		data: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
		createMitVerkauf: vi.fn(),
		createKunde: vi.fn(),
	}),
);

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/session", () => ({
	getCurrentProfilId: vi.fn().mockResolvedValue("profil-1"),
}));
vi.mock("@/lib/data/kunde", () => ({ createKunde }));
vi.mock("@/lib/data/reservierung", () => ({
	createReservierungMitProfil: data.create,
	createReservierungMitVerkauf: createMitVerkauf,
	updateReservierung: data.update,
	deleteReservierung: data.remove,
}));

import { formMitWerten as formData } from "../__tests__/test-utils";
import {
	createReservierungAction,
	type ReservierungFormState,
	setzeReservierungStatusAction,
	updateReservierungAction,
} from "./actions";

const saisonId = "11111111-1111-4111-8111-111111111111";
const standId = "22222222-2222-4222-8222-222222222222";
const kundeId = "33333333-3333-4333-8333-333333333333";
const verkaufId = "44444444-4444-4444-8444-444444444444";
const reservierungId = "55555555-5555-4555-8555-555555555555";
const neuerKundeId = "66666666-6666-4666-8666-666666666666";

/** ISO-Datum relativ zu heute (Betriebs-Kalender-unabhängig genug für Tests). */
function isoInTagen(tage: number) {
	const datum = new Date();
	datum.setUTCDate(datum.getUTCDate() + tage);
	return datum.toISOString().slice(0, 10);
}

const geplantesDatum = isoInTagen(30);

/** Felder des Inline-Panels „Neuer Kunde" im Reservierungsformular. */
const inlineKunde = {
	name: "Neue Familie",
	telefon: "+43 664 1234567",
	plz: "3100",
	adresse: "Hauptstraße 1",
};

const basis = {
	saison_id: saisonId,
	stand_id: standId,
	kunde_id: kundeId,
	versandart: "abholung",
	geplantes_datum: geplantesDatum,
};

describe("reservierungen actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		data.create.mockResolvedValue({});
		createMitVerkauf.mockResolvedValue({});
		data.update.mockResolvedValue({});
		createKunde.mockResolvedValue({ id: neuerKundeId, name: "Neue Familie" });
	});

	it("create: legt Reservierung an, Anzahlung als Zahl, ohne Status", async () => {
		const state: ReservierungFormState = await createReservierungAction(
			{},
			formData({ ...basis, anzahlungsbetrag: "20.50" }),
		);

		expect(state).toEqual({ success: true });
		expect(data.create).toHaveBeenCalledWith(
			expect.objectContaining({
				saison_id: saisonId,
				stand_id: standId,
				kunde_id: kundeId,
				versandart: "abholung",
				geplantes_datum: geplantesDatum,
				anzahlungsbetrag: 20.5,
			}),
		);
		expect(data.create.mock.calls[0][0].status).toBeUndefined();
		expect(createMitVerkauf).not.toHaveBeenCalled();
		expect(revalidatePath).toHaveBeenCalledWith("/protected/reservierungen");
	});

	it("create: legt Reservierung und Verknüpfung atomar an, wenn verkauf_id gesetzt ist", async () => {
		const state: ReservierungFormState = await createReservierungAction(
			{},
			formData({ ...basis, verkauf_id: verkaufId }),
		);

		expect(state).toEqual({ success: true });
		expect(createMitVerkauf).toHaveBeenCalledWith(
			expect.objectContaining({
				kunde_id: kundeId,
				geplantes_datum: geplantesDatum,
			}),
			verkaufId,
		);
		expect(data.create).not.toHaveBeenCalled();
		expect(revalidatePath).toHaveBeenCalledWith("/protected/reservierungen");
		expect(revalidatePath).toHaveBeenCalledWith("/protected/verkaeufe");
	});

	it("create: bereits verknüpfter Verkauf kommt als Meldung zurück", async () => {
		createMitVerkauf.mockRejectedValue(
			new Error("Der Verkauf ist bereits mit einer Reservierung verknüpft."),
		);

		const state = await createReservierungAction(
			{},
			formData({ ...basis, verkauf_id: verkaufId }),
		);

		expect(state.message).toContain("bereits mit einer Reservierung verknüpft");
		expect(state.success).toBeUndefined();
	});

	it("create: leere Anzahlung wird null, nicht 0", async () => {
		await createReservierungAction({}, formData(basis));

		expect(data.create.mock.calls[0][0].anzahlungsbetrag).toBeNull();
	});

	it("create: fehlender Kunde ist ein Feldfehler", async () => {
		const state = await createReservierungAction(
			{},
			formData({ ...basis, kunde_id: "" }),
		);

		expect(state.errors?.kunde_id).toBeDefined();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("create: ungültiges Datumsformat ist ein Feldfehler", async () => {
		const state = await createReservierungAction(
			{},
			formData({ ...basis, geplantes_datum: "15.06.2026" }),
		);

		expect(state.errors?.geplantes_datum).toBeDefined();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("update: setzt den Status", async () => {
		const state = await updateReservierungAction(
			{},
			formData({ id: "reservierung-1", ...basis, status: "erfuellt" }),
		);

		expect(state).toEqual({ success: true });
		expect(data.update).toHaveBeenCalledWith(
			"reservierung-1",
			expect.objectContaining({
				kunde_id: kundeId,
				geplantes_datum: geplantesDatum,
				status: "erfuellt",
			}),
		);
	});

	it("create: lehnt ein geplantes Datum in der Vergangenheit ab", async () => {
		const state = await createReservierungAction(
			{},
			formData({ ...basis, geplantes_datum: isoInTagen(-1) }),
		);

		expect(state.errors?.geplantes_datum?.[0]).toBe(
			"Geplantes Datum darf nicht in der Vergangenheit liegen.",
		);
		expect(data.create).not.toHaveBeenCalled();
		expect(createKunde).not.toHaveBeenCalled();
	});

	it("create: legt den Inline-Kunden an und verknüpft die Reservierung mit ihm", async () => {
		const state = await createReservierungAction(
			{},
			formData({
				...basis,
				kunde_id: "",
				neuer_kunde: "1",
				...inlineKunde,
			}),
		);

		expect(state).toEqual({ success: true });
		expect(createKunde).toHaveBeenCalledWith({
			name: "Neue Familie",
			telefon: "+43 664 1234567",
			plz: "3100",
			adresse: "Hauptstraße 1",
			ist_firma: false,
		});
		expect(data.create).toHaveBeenCalledWith(
			expect.objectContaining({ kunde_id: neuerKundeId }),
		);
	});

	it("create: meldet ungültige Inline-Kundenfelder zusammen mit der Reservierung", async () => {
		const state = await createReservierungAction(
			{},
			formData({
				...basis,
				kunde_id: "",
				neuer_kunde: "1",
				...inlineKunde,
				plz: "12",
			}),
		);

		expect(state.errors?.plz).toBeDefined();
		expect(createKunde).not.toHaveBeenCalled();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("create: legt keinen Inline-Kunden an, wenn die Reservierung ungültig ist", async () => {
		const state = await createReservierungAction(
			{},
			formData({
				...basis,
				stand_id: "",
				kunde_id: "",
				neuer_kunde: "1",
				...inlineKunde,
			}),
		);

		expect(state.errors?.stand_id).toBeDefined();
		expect(createKunde).not.toHaveBeenCalled();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("create: gibt den schon angelegten Kunden zurück, wenn die Reservierung danach scheitert", async () => {
		data.create.mockRejectedValueOnce(new Error("DB-Fehler"));

		const state = await createReservierungAction(
			{},
			formData({
				...basis,
				kunde_id: "",
				neuer_kunde: "1",
				...inlineKunde,
			}),
		);

		expect(state.message).toBe("DB-Fehler");
		expect(state.kunde).toEqual({
			id: neuerKundeId,
			name: "Neue Familie",
		});
	});

	it("status: setzt den übergebenen Status und revalidiert alle Listen", async () => {
		await setzeReservierungStatusAction(
			formData({ id: reservierungId, status: "erfuellt" }),
		);

		expect(data.update).toHaveBeenCalledWith(reservierungId, {
			status: "erfuellt",
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected");
		expect(revalidatePath).toHaveBeenCalledWith("/protected/reservierungen");
		expect(revalidatePath).toHaveBeenCalledWith("/protected/verkaeufe");

		// Toggle zurück in der Gegenrichtung.
		await setzeReservierungStatusAction(
			formData({ id: reservierungId, status: "offen" }),
		);
		expect(data.update).toHaveBeenLastCalledWith(reservierungId, {
			status: "offen",
		});
	});

	it("status: ignoriert ungültige IDs und Status außerhalb von offen/erfuellt", async () => {
		await setzeReservierungStatusAction(
			formData({ id: "keine-uuid", status: "erfuellt" }),
		);
		await setzeReservierungStatusAction(
			formData({ id: reservierungId, status: "storniert" }),
		);
		await setzeReservierungStatusAction(
			formData({ id: reservierungId, status: "geliefert" }),
		);

		expect(data.update).not.toHaveBeenCalled();
	});
});
