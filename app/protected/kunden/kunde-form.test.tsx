import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
	createKundeAction: vi.fn().mockResolvedValue({
		errors: { name: ["Name fehlt"] },
	}),
	updateKundeAction: vi.fn(),
}));

import { createKundeAction } from "./actions";
import { KundeForm } from "./kunde-form";

describe("KundeForm", () => {
	it("behält getippte Werte und sendet sie, wenn die Validierung fehlschlägt", async () => {
		render(<KundeForm mode="create" />);

		const plz = screen.getByLabelText("PLZ") as HTMLInputElement;
		fireEvent.change(plz, { target: { value: "3100" } });
		fireEvent.submit(
			screen.getByRole("button", { name: "Kunde anlegen" }).closest("form")!,
		);

		await waitFor(() => {
			expect(screen.getByText("Name fehlt")).toBeInTheDocument();
		});

		// Der Action muss dieselben Werte erreichen, die im Formular stehen.
		const formData = vi.mocked(createKundeAction).mock.calls[0][1] as FormData;
		expect(formData.get("plz")).toBe("3100");

		expect(plz.value).toBe("3100");
	});

	it("validiert Felder direkt beim Tippen", () => {
		render(<KundeForm mode="create" />);

		const name = screen.getByLabelText("Name");
		fireEvent.change(name, { target: { value: "M" } });
		expect(
			screen.queryByText("Name ist erforderlich."),
		).not.toBeInTheDocument();

		fireEvent.change(name, { target: { value: " " } });
		expect(screen.getByText("Name ist erforderlich.")).toBeInTheDocument();

		const telefon = screen.getByLabelText("Telefon");
		fireEvent.change(telefon, { target: { value: "123" } });
		expect(
			screen.getByText("Telefonnummer mit mindestens 8 Ziffern."),
		).toBeInTheDocument();

		fireEvent.change(telefon, { target: { value: "+43 664 1234567" } });
		expect(
			screen.queryByText("Telefonnummer mit mindestens 8 Ziffern."),
		).not.toBeInTheDocument();
	});
});
