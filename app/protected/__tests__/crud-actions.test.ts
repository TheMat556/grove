// @vitest-environment node
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createKunde, deleteKunde, updateKunde } from "@/lib/data/kunde";
import {
	createProdukt,
	deleteProdukt,
	updateProdukt,
} from "@/lib/data/produkt";

// "use server"-Dateien ziehen next/cache und next/navigation rein – beide
// außerhalb eines laufenden Next-Servers durch Stubs ersetzen. Die Daten-
// Module ebenfalls, damit die Actions ohne Supabase-Cookies lauffähig sind.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/kunde", () => ({
	createKunde: vi.fn().mockResolvedValue({}),
	updateKunde: vi.fn().mockResolvedValue({}),
	deleteKunde: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/data/produkt", () => ({
	createProdukt: vi.fn().mockResolvedValue({}),
	updateProdukt: vi.fn().mockResolvedValue({}),
	deleteProdukt: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/data/session", () => ({
	getCurrentProfilId: vi.fn().mockResolvedValue("profil-1"),
}));

import {
	createKundeAction,
	deleteKundeAction,
	type KundeFormState,
	updateKundeAction,
} from "@/app/protected/kunden/actions";
import {
	createProduktAction,
	deleteProduktAction,
	type ProduktFormState,
	updateProduktAction,
} from "@/app/protected/produkte/actions";

function formMitWerten(werte: Record<string, string>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(werte)) {
		formData.set(key, value);
	}
	return formData;
}

describe("kunden actions", () => {
	const basis = {
		name: "Maria Huber",
		telefon: "+43 664 1234567",
		adresse: "Bahnhofstraße 5",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("create: unchecked checkbox saves ist_firma=false and revalidates", async () => {
		const state: KundeFormState = await createKundeAction(
			{},
			formMitWerten(basis),
		);
		expect(state.errors).toBeUndefined();
		expect(state.success).toBe(true);
		expect(createKunde).toHaveBeenCalledWith({
			name: "Maria Huber",
			telefon: "+43 664 1234567",
			adresse: "Bahnhofstraße 5",
			ist_firma: false,
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/kunden");
	});

	it("create: missing name yields field error, not a DB call", async () => {
		const state: KundeFormState = await createKundeAction(
			{},
			formMitWerten({ ...basis, name: "" }),
		);
		expect(state.errors?.name).toBeDefined();
		expect(state.message).toBeUndefined();
		expect(createKunde).not.toHaveBeenCalled();
	});

	it("update: missing id is rejected before validation", async () => {
		const state: KundeFormState = await updateKundeAction(
			{},
			formMitWerten(basis),
		);
		expect(state.message).toBeDefined();
		expect(state.errors).toBeUndefined();
		expect(updateKunde).not.toHaveBeenCalled();
	});

	it("update: valid form returns success for the dialog and revalidates", async () => {
		const state: KundeFormState = await updateKundeAction(
			{},
			formMitWerten({ id: "kunde-1", ...basis, ist_firma: "on" }),
		);

		expect(state).toEqual({ success: true });
		expect(updateKunde).toHaveBeenCalledWith("kunde-1", {
			name: "Maria Huber",
			telefon: "+43 664 1234567",
			adresse: "Bahnhofstraße 5",
			ist_firma: true,
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/kunden");
		expect(redirect).not.toHaveBeenCalled();
	});

	it("delete: removes the customer and revalidates", async () => {
		await deleteKundeAction(formMitWerten({ id: "kunde-1" }));

		expect(deleteKunde).toHaveBeenCalledWith("kunde-1");
		expect(revalidatePath).toHaveBeenCalledWith("/protected/kunden");
	});
});

describe("produkte actions", () => {
	const basis = {
		art: "Baum",
		bezeichnung: "Nordmanntanne",
		von_cm: "100",
		bis_cm: "200",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("create: valid form saves coerced sizes and revalidates", async () => {
		const state: ProduktFormState = await createProduktAction(
			{},
			formMitWerten(basis),
		);
		expect(state.errors).toBeUndefined();
		expect(state.success).toBe(true);
		expect(createProdukt).toHaveBeenCalledWith({
			art: "Baum",
			bezeichnung: "Nordmanntanne",
			von_cm: 100,
			bis_cm: 200,
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/produkte");
	});

	it("create: empty size fields are validation errors, not silent 0", async () => {
		const state: ProduktFormState = await createProduktAction(
			{},
			formMitWerten({ art: "Baum", bezeichnung: "x" }),
		);
		expect(state.errors?.von_cm).toBeDefined();
		expect(state.errors?.bis_cm).toBeDefined();
		expect(state.success).toBeUndefined();
	});

	it("create: bis_cm < von_cm is a field error on bis_cm", async () => {
		const state: ProduktFormState = await createProduktAction(
			{},
			formMitWerten({ ...basis, bis_cm: "50" }),
		);
		expect(state.errors?.bis_cm).toBeDefined();
		expect(state.success).toBeUndefined();
	});

	it("update: empty size fields are validation errors, not silent 0", async () => {
		const state: ProduktFormState = await updateProduktAction(
			{},
			formMitWerten({ id: "00000000-0000-0000-0000-000000000000" }),
		);
		expect(state.errors?.von_cm).toBeDefined();
		expect(state.errors?.bis_cm).toBeDefined();
	});

	it("update: bis_cm < von_cm is a field error, not a DB error", async () => {
		const state: ProduktFormState = await updateProduktAction(
			{},
			formMitWerten({
				id: "00000000-0000-0000-0000-000000000000",
				...basis,
				bis_cm: "50",
			}),
		);
		expect(state.errors?.bis_cm).toBeDefined();
		expect(state.message).toBeUndefined();
	});

	it("update: valid form returns success for the dialog and revalidates", async () => {
		const state: ProduktFormState = await updateProduktAction(
			{},
			formMitWerten({ id: "produkt-1", ...basis, bis_cm: "250" }),
		);

		expect(state).toEqual({ success: true });
		expect(updateProdukt).toHaveBeenCalledWith("produkt-1", {
			art: "Baum",
			bezeichnung: "Nordmanntanne",
			von_cm: 100,
			bis_cm: 250,
		});
		expect(revalidatePath).toHaveBeenCalledWith("/protected/produkte");
		expect(redirect).not.toHaveBeenCalled();
	});

	it("delete: removes the product and revalidates", async () => {
		await deleteProduktAction(formMitWerten({ id: "produkt-1" }));

		expect(deleteProdukt).toHaveBeenCalledWith("produkt-1");
		expect(revalidatePath).toHaveBeenCalledWith("/protected/produkte");
	});

	it("delete: FK error becomes the list banner instead of crashing", async () => {
		vi.mocked(deleteProdukt).mockRejectedValueOnce(new Error("FK-Verstoß"));

		await deleteProduktAction(formMitWerten({ id: "produkt-1" }));

		expect(redirect).toHaveBeenCalledWith(
			"/protected/produkte?error=FK-Versto%C3%9F",
		);
	});
});
