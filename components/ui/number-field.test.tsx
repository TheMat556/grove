import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./number-field";

function formData() {
	return new FormData(document.querySelector("form") as HTMLFormElement);
}

describe("NumberField", () => {
	it("submits the raw number, unabhängig von der Anzeige-Formatierung", () => {
		render(
			<form>
				<NumberField name="preis" defaultValue={45.5} step={0.01} />
			</form>,
		);

		const formData = new FormData(
			document.querySelector("form") as HTMLFormElement,
		);
		expect(formData.get("preis")).toBe("45.5");
	});

	it("Stepper erhöht den Wert und das Formular folgt", () => {
		render(
			<form>
				<label htmlFor="menge">Menge</label>
				<NumberField id="menge" name="menge" defaultValue={2} step={1} />
			</form>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Erhöhen" }));

		expect(screen.getByLabelText("Menge")).toHaveValue("3");
		expect(formData().get("menge")).toBe("3");
	});

	it("initialisiert neu, wenn sich defaultValue nach dem ersten Render ändert", () => {
		// Realer Fall: revalidatePath rendert das offene Formular mit frischen
		// Daten neu. Base UI warnt dann vor einem wechselnden Default eines
		// unkontrollierten Felds; stattdessen muss das Feld den neuen Wert zeigen.
		const fehler = vi.spyOn(console, "error").mockImplementation(() => {});

		const { rerender } = render(
			<form>
				<label htmlFor="anzahlung">Anzahlung</label>
				<NumberField id="anzahlung" name="anzahlung" defaultValue={20} />
			</form>,
		);
		rerender(
			<form>
				<label htmlFor="anzahlung">Anzahlung</label>
				<NumberField id="anzahlung" name="anzahlung" defaultValue={99} />
			</form>,
		);

		const warnungen = fehler.mock.calls.map((call) => String(call[0]));
		expect(
			warnungen.some((meldung) =>
				meldung.includes("changing the default value state"),
			),
		).toBe(false);
		expect(formData().get("anzahlung")).toBe("99");
		fehler.mockRestore();
	});
});
