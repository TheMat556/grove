// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// "use server"-Datei: Session + next/cache gestubbt, darunter der gemeinsame
// entity-actions-Factory-Pfad; die Datenfunktionen sind gemockt.
const { revalidatePath, data, createMitVerkauf } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	data: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
	createMitVerkauf: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/session", () => ({
	getCurrentProfilId: vi.fn().mockResolvedValue("profil-1"),
}));
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
	updateReservierungAction,
} from "./actions";

const saisonId = "11111111-1111-4111-8111-111111111111";
const standId = "22222222-2222-4222-8222-222222222222";
const kundeId = "33333333-3333-4333-8333-333333333333";
const verkaufId = "44444444-4444-4444-8444-444444444444";

const basis = {
	saison_id: saisonId,
	stand_id: standId,
	kunde_id: kundeId,
	versandart: "abholung",
	geplantes_datum: "2026-06-15",
};

describe("reservierungen actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		data.create.mockResolvedValue({});
		createMitVerkauf.mockResolvedValue({});
		data.update.mockResolvedValue({});
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
				geplantes_datum: "2026-06-15",
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
				geplantes_datum: "2026-06-15",
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
				geplantes_datum: "2026-06-15",
				status: "erfuellt",
			}),
		);
	});
});
