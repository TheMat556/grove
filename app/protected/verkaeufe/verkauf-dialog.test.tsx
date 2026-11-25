import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createVerkaufAction, createReservierungAction } = vi.hoisted(() => ({
	createVerkaufAction: vi.fn(),
	createReservierungAction: vi.fn(),
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
					createElement("option", { key: item.value, value: item.value }, item.label),
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
	createVerkaufAction,
	updateVerkaufAction: vi.fn(),
	deleteVerkaufAction: vi.fn(),
}));
vi.mock("../reservierungen/actions", () => ({
	createReservierungAction,
	updateReservierungAction: vi.fn(),
	deleteReservierungAction: vi.fn(),
}));
vi.mock("../kunden/actions", () => ({
	createKundeAction: vi.fn(),
	updateKundeAction: vi.fn(),
	deleteKundeAction: vi.fn(),
}));

import { VerkaufDialog } from "./verkauf-dialog";

const saisonId = "11111111-1111-4111-8111-111111111111";
const standId = "22222222-2222-4222-8222-222222222222";
const verkaufId = "33333333-3333-4333-8333-333333333333";
const kundeId = "44444444-4444-4444-8444-444444444444";

function renderDialog() {
	render(
		<VerkaufDialog
			saisonId={saisonId}
			staende={[{ id: standId, bezeichnung: "Stand Nord" }]}
			produkte={[]}
			preise={{}}
			kunden={[{ id: kundeId, name: "Familie Huber" }]}
			trigger={<button type="button">Neu</button>}
		/>,
	);
}

/** Anlegen abschicken: Action ist gemockt, Formular meldet Erfolg. */
async function verkaufSpeichern() {
	fireEvent.click(screen.getByRole("button", { name: "Neu" }));
	fireEvent.change(screen.getByLabelText("Stand"), {
		target: { value: standId },
	});
	fireEvent.submit(
		screen.getByRole("button", { name: "Weiter" }).closest("form")!,
	);
	await waitFor(() => {
		expect(
			screen.getByRole("heading", { name: "Reservierung anlegen" }),
		).toBeInTheDocument();
	});
}

describe("VerkaufDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createVerkaufAction.mockResolvedValue({
			success: true,
			verkauf: { id: verkaufId, stand_id: standId },
			positionen: [],
		});
		createReservierungAction.mockResolvedValue({ success: true });
	});

	it("zeigt den Stepper und öffnet nach Weiter den Reservierungsschritt", async () => {
		renderDialog();
		fireEvent.click(screen.getByRole("button", { name: "Neu" }));

		// Stepper sitzt oberhalb von Titel/Beschreibung (erstes Element im Dialog).
		const dialogInhalt = document.querySelector('[data-slot="dialog-content"]');
		expect(dialogInhalt?.firstElementChild?.tagName).toBe("OL");
		// Stepper: beide Schritte sichtbar, Schritt 1 aktiv.
		expect(screen.getByText("Verkauf")).toBeInTheDocument();
		expect(
			screen
				.getByText("Verkauf")
				.closest("li")
				?.querySelector('[aria-current="step"]'),
		).toHaveTextContent("1");

		fireEvent.change(screen.getByLabelText("Stand"), {
			target: { value: standId },
		});
		fireEvent.submit(
			screen.getByRole("button", { name: "Weiter" }).closest("form")!,
		);
		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Reservierung anlegen" }),
			).toBeInTheDocument();
		});
		expect(
			screen
				.getByText("Reservierung", { selector: "li span:last-child" })
				.closest("li")
				?.querySelector('[aria-current="step"]'),
		).toHaveTextContent("2");
	});

	it("kehrt über Zurück zum Verkauf zum gespeicherten Verkauf zurück", async () => {
		renderDialog();
		await verkaufSpeichern();

		fireEvent.click(screen.getByRole("button", { name: "Zurück zum Verkauf" }));
		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Verkauf bearbeiten" }),
			).toBeInTheDocument();
		});
	});

	it("zeigt nach dem Speichern den Reservierungsschritt", async () => {
		renderDialog();
		await verkaufSpeichern();

		// Stand kommt fest aus dem Verkauf, kein zweites Stand-Select.
		expect(screen.queryByLabelText("Stand")).not.toBeInTheDocument();
		// „Ohne Reservierung" ist vorerst deaktiviert; Schließen geht über X.
		expect(
			screen.getByRole("button", { name: "Ohne Reservierung" }),
		).toBeDisabled();

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await waitFor(() => {
			expect(
				screen.queryByRole("heading", { name: "Reservierung anlegen" }),
			).not.toBeInTheDocument();
		});
	});

	it("verknüpft die Reservierung mit dem gespeicherten Verkauf", async () => {
		renderDialog();
		await verkaufSpeichern();

		fireEvent.change(screen.getByLabelText("Kunde"), {
			target: { value: kundeId },
		});
		fireEvent.submit(
			screen
				.getByRole("button", { name: "Reservierung anlegen" })
				.closest("form")!,
		);

		await waitFor(() => {
			expect(createReservierungAction).toHaveBeenCalled();
		});
		const formData = vi.mocked(createReservierungAction).mock
			.calls[0][1] as FormData;
		expect(formData.get("verkauf_id")).toBe(verkaufId);
		expect(formData.get("stand_id")).toBe(standId);
		expect(formData.get("saison_id")).toBe(saisonId);
	});

	it("beginnt beim erneuten Öffnen wieder bei den Verkaufsdaten", async () => {
		renderDialog();
		await verkaufSpeichern();

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		fireEvent.click(screen.getByRole("button", { name: "Neu" }));

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Verkauf erfassen" }),
			).toBeInTheDocument();
		});
	});
});
