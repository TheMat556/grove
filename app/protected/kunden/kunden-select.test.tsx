import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KundenSelect } from "./kunden-select";

const kunden = Array.from({ length: 8 }, (_, index) => ({
	id: `kunde-${index + 1}`,
	name: `Kunde ${index + 1}`,
}));

function renderSelect(props: Partial<Parameters<typeof KundenSelect>[0]> = {}) {
	const onChange = vi.fn();
	const onAnlegen = vi.fn();
	const utils = render(
		<KundenSelect
			id="kunde"
			kunden={kunden}
			value=""
			onChange={onChange}
			onAnlegen={onAnlegen}
			{...props}
		/>,
	);
	return { onChange, onAnlegen, ...utils };
}

/** Öffnet die Liste ohne Suchtext (Base UI öffnet auf mousedown). */
function oeffnen() {
	fireEvent.mouseDown(screen.getByRole("combobox"));
}

/** Tippen: Base UI ignoriert Events ohne inputType (Autofill-Pfad). */
function tippen(text: string) {
	fireEvent.input(screen.getByRole("combobox"), {
		target: { value: text },
		inputType: "insertText",
	});
}

describe("KundenSelect", () => {
	it("zeigt maximal 5 Einträge, der letzte ist Kunde anlegen", () => {
		renderSelect();
		oeffnen();

		const optionen = screen.getAllByRole("option");
		expect(optionen).toHaveLength(5);
		expect(optionen[4]).toHaveTextContent("+ Kunde anlegen");
	});

	it("filtert beim Tippen und heftet Kunde anlegen als letzten Eintrag an", () => {
		renderSelect();
		tippen("Kunde 7");

		const optionen = screen.getAllByRole("option");
		expect(optionen).toHaveLength(2);
		expect(optionen[0]).toHaveTextContent("Kunde 7");
		expect(optionen[1]).toHaveTextContent(/anlegen/);
	});

	it("wählt einen Kunden aus", () => {
		const { onChange } = renderSelect();
		oeffnen();

		fireEvent.click(screen.getByRole("option", { name: "Kunde 2" }));

		expect(onChange).toHaveBeenCalledWith("kunde-2");
	});

	it("öffnet über den letzten Eintrag die Inline-Anlage", () => {
		const { onAnlegen } = renderSelect();
		oeffnen();

		fireEvent.click(screen.getByRole("option", { name: "+ Kunde anlegen" }));

		expect(onAnlegen).toHaveBeenCalledTimes(1);
	});
});
