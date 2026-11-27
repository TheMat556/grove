import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, updateEinstellungen, getCurrentProfilId } = vi.hoisted(
	() => ({
		revalidatePath: vi.fn(),
		updateEinstellungen: vi.fn(async () => ({})),
		getCurrentProfilId: vi.fn(async () => "profil-1"),
	}),
);

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/data/einstellungen", () => ({ updateEinstellungen }));
vi.mock("@/lib/data/session", () => ({ getCurrentProfilId }));

import { formMitWerten } from "../__tests__/test-utils";
import { updateEinstellungenAction } from "./actions";

describe("updateEinstellungenAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("speichert die Formularwerte und revalidiert Dashboard + Seite", async () => {
		const state = await updateEinstellungenAction(
			{},
			formMitWerten({
				sms_aktiv: "on",
				sms_vorlauf_tage: "2",
				sms_uhrzeit: "08:30",
			}),
		);

		expect(state.success).toBe(true);
		expect(updateEinstellungen).toHaveBeenCalledWith({
			sms_aktiv: true,
			sms_vorlauf_tage: 2,
			sms_uhrzeit: "08:30",
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/einstellungen");
		expect(revalidatePath).toHaveBeenCalledWith("/protected");
	});

	it("gibt einen Feldfehler statt 0 zurück, wenn die Vorlaufzeit leer ist", async () => {
		const state = await updateEinstellungenAction(
			{},
			formMitWerten({ sms_vorlauf_tage: "", sms_uhrzeit: "08:00" }),
		);

		expect(state.errors?.sms_vorlauf_tage?.[0]).toBeTruthy();
		expect(updateEinstellungen).not.toHaveBeenCalled();
	});

	it("meldet eine fehlende Anmeldung als Fehlerzustand", async () => {
		getCurrentProfilId.mockRejectedValueOnce(new Error("Nicht angemeldet."));

		const state = await updateEinstellungenAction(
			{},
			formMitWerten({
				sms_aktiv: "on",
				sms_vorlauf_tage: "1",
				sms_uhrzeit: "08:00",
			}),
		);

		expect(state.message).toBe("Nicht angemeldet.");
		expect(updateEinstellungen).not.toHaveBeenCalled();
	});
});
