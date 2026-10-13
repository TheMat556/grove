// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// "use server"-Dateien ziehen next/cache und next/navigation rein – beide
// außerhalb eines laufenden Next-Servers durch Stubs ersetzen. Die Daten-
// Module ebenfalls, damit die Actions ohne Supabase-Cookies lauffähig sind.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/data/kunde", () => ({
	createKunde: vi.fn().mockResolvedValue({}),
	updateKunde: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/data/produkt", () => ({
	createProdukt: vi.fn().mockResolvedValue({}),
	updateProdukt: vi.fn().mockResolvedValue({}),
}));

import {
	createKundeAction,
	type KundeFormState,
	updateKundeAction,
} from "@/app/protected/kunden/actions";
import {
	createProduktAction,
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

	it("create: unchecked checkbox saves ist_firma=false", async () => {
		const state: KundeFormState = await createKundeAction(
			{},
			formMitWerten(basis),
		);
		expect(state.errors).toBeUndefined();
		expect(state.success).toBe(true);
	});

	it("create: missing name yields field error, not a DB call", async () => {
		const state: KundeFormState = await createKundeAction(
			{},
			formMitWerten({ ...basis, name: "" }),
		);
		expect(state.errors?.name).toBeDefined();
		expect(state.message).toBeUndefined();
	});

	it("update: missing id is rejected before validation", async () => {
		const state: KundeFormState = await updateKundeAction(
			{},
			formMitWerten(basis),
		);
		expect(state.message).toBeDefined();
		expect(state.errors).toBeUndefined();
	});
});

describe("produkte actions", () => {
	const basis = {
		art: "Baum",
		bezeichnung: "Nordmanntanne",
		von_cm: "100",
		bis_cm: "200",
	};

	it("create: valid form succeeds", async () => {
		const state: ProduktFormState = await createProduktAction(
			{},
			formMitWerten(basis),
		);
		expect(state.errors).toBeUndefined();
		expect(state.success).toBe(true);
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
});
