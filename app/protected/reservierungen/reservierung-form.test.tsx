import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";

vi.mock("@/components/ui/popover", () => ({
	Popover: ({ children }: { children: ReactNode }) => <>{children}</>,
	PopoverTrigger: ({
		render,
		children,
	}: {
		render: ReactElement;
		children: ReactNode;
	}) => cloneElement(render, {}, children),
	PopoverContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/calendar", () => ({
	Calendar: ({
		onSelect,
		disabled,
	}: {
		onSelect: (value: Date | undefined) => void;
		disabled?: { before: Date };
	}) => (
		<button
			type="button"
			data-gesperrt={disabled?.before ? "ja" : "nein"}
			onClick={() => onSelect(new Date("2026-06-15"))}
		>
			Pick date
		</button>
	),
}));
vi.mock("@/components/ui/select", async () => {
	const { createElement, Children, isValidElement } = await import("react");
	return {
		Select({
			name,
			items = [],
			value,
			defaultValue,
			onValueChange,
			children,
		}: {
			name?: string;
			items?: ReadonlyArray<{ value: string; label: ReactNode }>;
			value?: string | null;
			defaultValue?: string;
			onValueChange?: (value: string) => void;
			children?: ReactNode;
		}) {
			const trigger = Children.toArray(children).find(
				(kid) =>
					isValidElement(kid) &&
					!!(kid as ReactElement<{ id?: string }>).props.id,
			) as ReactElement<{ id?: string }> | undefined;
			const id = trigger?.props.id;
			const shared = {
				id,
				name,
				onChange: (event: { target: { value: string } }) =>
					onValueChange?.(event.target.value),
			};
			return createElement(
				"select",
				value !== undefined && value !== null
					? { ...shared, value }
					: { ...shared, defaultValue },
				createElement("option", { value: "" }),
				items.map((item) =>
					createElement(
						"option",
						{ key: item.value, value: item.value },
						item.label,
					),
				),
			);
		},
		SelectTrigger: () => null,
		SelectContent: () => null,
		SelectItem: () => null,
		SelectValue: () => null,
		SelectSeparator: () => null,
	};
});

vi.mock("../kunden/kunden-select", () => ({
	KundenSelect: ({
		id,
		kunden,
		value,
		onChange,
		onAnlegen,
	}: {
		id: string;
		kunden: Array<{ id: string; name: string }>;
		value: string;
		onChange: (kundeId: string) => void;
		onAnlegen: () => void;
	}) => (
		<select
			id={id}
			name="kunde_id"
			value={value}
			onChange={(event) => {
				const naechster = event.target.value;
				if (naechster === "__anlegen__") onAnlegen();
				else onChange(naechster);
			}}
		>
			<option value="" />
			{kunden.map((kunde) => (
				<option key={kunde.id} value={kunde.id}>
					{kunde.name}
				</option>
			))}
			<option value="__anlegen__">+ Kunde anlegen</option>
		</select>
	),
}));

vi.mock("./actions", () => ({
	createReservierungAction: vi.fn().mockResolvedValue({ success: true }),
	updateReservierungAction: vi.fn(),
}));
vi.mock("../kunden/actions", () => ({
	createKundeAction: vi.fn().mockResolvedValue({}),
	updateKundeAction: vi.fn(),
	deleteKundeAction: vi.fn(),
}));

import { createKundeAction } from "../kunden/actions";
import { createReservierungAction } from "./actions";
import { ReservierungForm } from "./reservierung-form";

const saisonId = "11111111-1111-4111-8111-111111111111";
const standId = "22222222-2222-4222-8222-222222222222";
const kundeId = "33333333-3333-4333-8333-333333333333";
const verkaufId = "44444444-4444-4444-8444-444444444444";
const neuerKundeId = "55555555-5555-4555-8555-555555555555";

function renderForm(
	props: { verkaeufe?: Array<{ id: string; label: string }> } = {},
) {
	render(
		<ReservierungForm
			mode="create"
			saisonId={saisonId}
			staende={[{ id: standId, bezeichnung: "Stand Nord" }]}
			kunden={[{ id: kundeId, name: "Familie Huber" }]}
			onSuccess={() => {}}
			{...props}
		/>,
	);
}

function submitForm() {
	fireEvent.submit(
		screen
			.getByRole("button", { name: "Reservierung anlegen" })
			.closest("form")!,
	);
}

async function gesendeteFormData() {
	await waitFor(() => {
		expect(createReservierungAction).toHaveBeenCalled();
	});
	return vi.mocked(createReservierungAction).mock.calls[0][1] as FormData;
}

describe("ReservierungForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sendet alle Felder mit gültigen Werten (UUIDs + ISO-Datum)", async () => {
		renderForm();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: kundeId },
		});
		fireEvent.change(screen.getByLabelText("Stand"), {
			target: { value: standId },
		});
		fireEvent.click(screen.getByRole("button", { name: "Pick date" }));

		submitForm();
		const formData = await gesendeteFormData();

		expect(formData.get("saison_id")).toBe(saisonId);
		expect(formData.get("kunde_id")).toBe(kundeId);
		expect(formData.get("stand_id")).toBe(standId);
		expect(formData.get("versandart")).toBe("abholung");
		expect(formData.get("geplantes_datum")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("sperrt beim Anlegen vergangene Tage im Kalender", () => {
		renderForm();

		expect(screen.getByRole("button", { name: "Pick date" })).toHaveAttribute(
			"data-gesperrt",
			"ja",
		);
	});

	it("validiert das Datum sofort nach der Auswahl (ohne Absenden)", () => {
		renderForm();

		// Der Kalender-Mock liefert ein Datum in der Vergangenheit.
		fireEvent.click(screen.getByRole("button", { name: "Pick date" }));

		expect(
			screen.getByText(
				"Geplantes Datum darf nicht in der Vergangenheit liegen.",
			),
		).toBeInTheDocument();
		expect(createReservierungAction).not.toHaveBeenCalled();
	});

	it("erlaubt beim Bearbeiten weiterhin vergangene Termine", () => {
		render(
			<ReservierungForm
				mode="edit"
				saisonId={saisonId}
				staende={[{ id: standId, bezeichnung: "Stand Nord" }]}
				kunden={[{ id: kundeId, name: "Familie Huber" }]}
				reservierung={
					{
						id: "66666666-6666-4666-8666-666666666666",
						saison_id: saisonId,
						stand_id: standId,
						profil_id: "77777777-7777-4777-8777-777777777777",
						kunde_id: kundeId,
						versandart: "abholung",
						geplantes_datum: "2026-06-01",
						status: "offen",
						anzahlungsbetrag: null,
						anmerkung: null,
						reserviert_am: "2026-05-01T09:00:00.000Z",
					} as never
				}
				onSuccess={() => {}}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Pick date" }));

		expect(
			screen.queryByText(
				"Geplantes Datum darf nicht in der Vergangenheit liegen.",
			),
		).not.toBeInTheDocument();
	});

	it("sendet den optional gewählten Verkauf mit", async () => {
		renderForm({ verkaeufe: [{ id: verkaufId, label: "Testverkauf" }] });

		fireEvent.change(screen.getByLabelText("Verkauf (optional)"), {
			target: { value: verkaufId },
		});

		submitForm();
		const formData = await gesendeteFormData();

		expect(formData.get("verkauf_id")).toBe(verkaufId);
	});

	it("deckt das Inline-Kundenformular animiert auf und wählt den angelegten Kunden aus", async () => {
		vi.mocked(createKundeAction).mockResolvedValueOnce({
			success: true,
			kunde: { id: neuerKundeId, name: "Neue Familie" },
		} as never);
		renderForm();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: "__anlegen__" },
		});
		await waitFor(() => {
			expect(screen.getByLabelText("Name")).toBeInTheDocument();
		});
		// Aufdeck-Maske: der animierte Grid-Wrapper umschließt das Panel.
		const maske = document.querySelector(".animate-aufdecken");
		expect(maske).not.toBeNull();
		expect(maske?.querySelector(".overflow-clip")).not.toBeNull();
		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Neue Familie" },
		});
		fireEvent.change(screen.getByLabelText("Telefon"), {
			target: { value: "+43 664 1234567" },
		});
		fireEvent.change(screen.getByLabelText("PLZ"), {
			target: { value: "3100" },
		});
		fireEvent.change(screen.getByLabelText("Adresse"), {
			target: { value: "Hauptstraße 1" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Kunde anlegen" }));

		await waitFor(() => {
			expect(createKundeAction).toHaveBeenCalled();
		});
		// Inline-Anlage sendet nicht die Reservierung ab.
		await waitFor(() => {
			expect(screen.getByLabelText("Kunde")).toHaveValue(neuerKundeId);
		});
		expect(createReservierungAction).not.toHaveBeenCalled();
	});

	it("sendet beim „Reservierung anlegen“ den Inline-Kunden mit", async () => {
		renderForm();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: "__anlegen__" },
		});
		await waitFor(() => {
			expect(screen.getByLabelText("Name")).toBeInTheDocument();
		});
		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Neue Familie" },
		});
		fireEvent.change(screen.getByLabelText("Telefon"), {
			target: { value: "+43 664 1234567" },
		});
		fireEvent.change(screen.getByLabelText("PLZ"), {
			target: { value: "3100" },
		});
		fireEvent.change(screen.getByLabelText("Adresse"), {
			target: { value: "Hauptstraße 1" },
		});

		submitForm();
		const formData = await gesendeteFormData();

		// Ein Klick auf „Reservierung anlegen" schickt den neuen Kunden mit.
		expect(formData.get("neuer_kunde")).toBe("1");
		expect(formData.get("name")).toBe("Neue Familie");
		expect(formData.get("telefon")).toBe("+43 664 1234567");
		expect(formData.get("plz")).toBe("3100");
		expect(formData.get("adresse")).toBe("Hauptstraße 1");
	});

	it("zeigt Feldfehler aus dem Reservierungs-Submit im Inline-Kundenformular", async () => {
		vi.mocked(createReservierungAction).mockResolvedValueOnce({
			errors: { plz: ["PLZ zwischen 1000 und 9999."] },
		} as never);
		renderForm();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: "__anlegen__" },
		});
		await waitFor(() => {
			expect(screen.getByLabelText("Name")).toBeInTheDocument();
		});

		submitForm();

		await waitFor(() => {
			expect(
				screen.getByText("PLZ zwischen 1000 und 9999."),
			).toBeInTheDocument();
		});
	});

	it("validiert das Inline-Kundenformular beim Tippen", () => {
		renderForm();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: "__anlegen__" },
		});

		const plz = screen.getByLabelText("PLZ");
		fireEvent.change(plz, { target: { value: "12" } });
		expect(screen.getByText("PLZ zwischen 1000 und 9999.")).toBeInTheDocument();

		fireEvent.change(plz, { target: { value: "3100" } });
		expect(
			screen.queryByText("PLZ zwischen 1000 und 9999."),
		).not.toBeInTheDocument();
	});

	it("nennt ungültige Kunden und Stände beim Namen", () => {
		expect(
			reservierungInsertSchema.shape.kunde_id.safeParse("").error?.issues[0]
				?.message,
		).toBe("Ungültiger Kunde.");
		expect(
			reservierungInsertSchema.shape.stand_id.safeParse("").error?.issues[0]
				?.message,
		).toBe("Ungültiger Stand.");
	});
});
