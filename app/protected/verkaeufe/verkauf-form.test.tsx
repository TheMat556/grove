import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ createVerkaufAction: vi.fn() }));

import { VerkaufForm } from "./verkauf-form";

const [baum, kreuz] = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		art: "Baum",
		bezeichnung: "Nordmanntanne",
	},
	{
		id: "22222222-2222-4222-8222-222222222222",
		art: "Kreuz",
		bezeichnung: "Kreuz Standard",
	},
];

describe("VerkaufForm", () => {
	it("zeigt die Preisempfehlung und übernimmt sie in den Einzelpreis", () => {
		render(
			<VerkaufForm
				saisonId="33333333-3333-4333-8333-333333333333"
				staende={[
					{
						id: "44444444-4444-4444-8444-444444444444",
						bezeichnung: "Stand Nord",
					},
				]}
				produkte={[baum, kreuz]}
				preise={{ [baum.id]: 45 }}
			/>,
		);

		const produkt = screen.getByLabelText("Produkt");
		expect(screen.getByRole("option", { name: /45,00/ })).toBeInTheDocument();

		fireEvent.change(produkt, { target: { value: baum.id } });
		expect(screen.getByLabelText("Einzelpreis")).toHaveValue("45");

		// Produkt ohne Empfehlung: Preis wird geleert, kein alter Wert bleibt hängen.
		fireEvent.change(produkt, { target: { value: kreuz.id } });
		expect(screen.getByLabelText("Einzelpreis")).toHaveValue("");
	});
});
