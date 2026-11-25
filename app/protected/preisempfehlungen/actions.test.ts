// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// "use server"-Datei: next/cache + Session werden gestubbt, darunter liegt der
// gemeinsame entity-actions-Factory-Pfad.
const { revalidatePath, data } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	data: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/session", () => ({
	getCurrentProfilId: vi.fn().mockResolvedValue("profil-1"),
}));
vi.mock("@/lib/data/preisempfehlung", () => ({
	createPreisempfehlung: data.create,
	updatePreisempfehlung: data.update,
	deletePreisempfehlung: data.remove,
}));

import { formMitWerten as formData } from "../__tests__/test-utils";
import {
	createPreisempfehlungAction,
	type PreisempfehlungFormState,
	updatePreisempfehlungAction,
} from "./actions";

const saisonId = "11111111-1111-4111-8111-111111111111";
const produktId = "22222222-2222-4222-8222-222222222222";

const basis = {
	saison_id: saisonId,
	produkt_id: produktId,
	preis: "45.50",
};

describe("preisempfehlungen actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		data.create.mockResolvedValue({});
		data.update.mockResolvedValue({});
	});

	it("create: Formularwerte werden validiert und als Zahl gespeichert", async () => {
		const state: PreisempfehlungFormState = await createPreisempfehlungAction(
			{},
			formData(basis),
		);

		expect(state).toEqual({ success: true });
		expect(data.create).toHaveBeenCalledWith({
			saison_id: saisonId,
			produkt_id: produktId,
			preis: 45.5,
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/preisempfehlungen");
	});

	it("create: leerer Preis ist ein Feldfehler, keine stille 0", async () => {
		const state = await createPreisempfehlungAction(
			{},
			formData({ ...basis, preis: "" }),
		);

		expect(state.errors?.preis).toBeDefined();
		expect(data.create).not.toHaveBeenCalled();
	});

	it("update: speichert geänderten Preis mit der ID", async () => {
		const state = await updatePreisempfehlungAction(
			{},
			formData({ id: "empfehlung-1", ...basis, preis: "50" }),
		);

		expect(state).toEqual({ success: true });
		expect(data.update).toHaveBeenCalledWith("empfehlung-1", {
			saison_id: saisonId,
			produkt_id: produktId,
			preis: 50,
		});
	});
});
