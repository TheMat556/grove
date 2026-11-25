import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
	createVerkaufAction: vi.fn(),
	updateVerkaufAction: vi.fn(),
	deleteVerkaufAction: vi.fn(),
}));

import { updateVerkaufAction } from "./actions";
import { VerkaufForm, type VerkaufZumBearbeiten } from "./verkauf-form";

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

const saisonId = "33333333-3333-4333-8333-333333333333";
const standId = "44444444-4444-4444-8444-444444444444";

describe("VerkaufForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

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

	it("behält kreuz_montiert beim Bearbeiten bestehender Positionen", async () => {
		vi.mocked(updateVerkaufAction).mockResolvedValue({ success: true });
		const verkauf = {
			id: "55555555-5555-4555-8555-555555555555",
			saison_id: saisonId,
			stand_id: standId,
			profil_id: "66666666-6666-4666-8666-666666666666",
			reservierung_id: null,
			aktion_bz: null,
			preis_gesamt: 25,
			anmerkung: null,
			verkauft_am: "2026-11-21T09:00:00.000Z",
			positionen: [
				{
					produkt_id: baum.id,
					menge: 1,
					einzelpreis: 25,
					hoehe_cm: 150,
					kreuz_montiert: true,
				},
			],
		} as unknown as VerkaufZumBearbeiten;

		render(
			<VerkaufForm
				saisonId={saisonId}
				staende={[{ id: standId, bezeichnung: "Stand Nord" }]}
				produkte={[baum, kreuz]}
				preise={{}}
				verkauf={verkauf}
			/>,
		);

		fireEvent.submit(
			screen.getByRole("button", { name: "Weiter" }).closest("form")!,
		);

		await waitFor(() => {
			expect(updateVerkaufAction).toHaveBeenCalled();
		});
		const formData = vi.mocked(updateVerkaufAction).mock
			.calls[0][1] as FormData;
		const positionen = JSON.parse(String(formData.get("positionen"))) as Array<{
			kreuz_montiert: boolean;
		}>;
		expect(positionen[0].kreuz_montiert).toBe(true);
	});
});
