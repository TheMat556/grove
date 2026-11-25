import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { VerkaufMitDetails } from "@/lib/data/verkauf";
import { VerkaufUebersichtDialog } from "./verkauf-uebersicht-dialog";

const verkauf = {
	id: "11111111-1111-4111-8111-111111111111",
	aktion_bz: "Weihnachtsmarkt",
	preis_gesamt: 70,
	anmerkung: "Kunde holt am Wochenende ab",
	verkauft_am: "2026-11-21T09:00:00.000Z",
	stand: { bezeichnung: "Stand Nord" },
	verkaeufer: { name: "Dev User" },
	reservierung: {
		versandart: "lieferung",
		geplantes_datum: "2026-12-01",
		status: "offen",
		anzahlungsbetrag: 20,
		kunde: {
			name: "Familie Huber",
			plz: "3100",
			adresse: "Hauptstraße 1",
		},
	},
	positionen: [
		{
			id: "88888888-8888-4888-8888-888888888888",
			menge: 2,
			einzelpreis: 35,
			hoehe_cm: 160,
			produkt: { art: "Baum", bezeichnung: "Nordmanntanne" },
		},
	],
} as VerkaufMitDetails;

describe("VerkaufUebersichtDialog", () => {
	it("zeigt Kopf, Positionen und Reservierung", () => {
		render(
			<VerkaufUebersichtDialog
				verkauf={verkauf}
				trigger={<button type="button">Ansehen</button>}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Ansehen" }));

		expect(screen.getByText(/Verkauf vom/)).toBeInTheDocument();
		expect(screen.getByText("Dev User")).toBeInTheDocument();
		expect(screen.getByText("Baum Nordmanntanne")).toBeInTheDocument();
		expect(screen.getByText("160 cm")).toBeInTheDocument();
		expect(screen.getByText(/Gesamt/)).toBeInTheDocument();
		expect(screen.getByText("Familie Huber")).toBeInTheDocument();
		expect(screen.getByText("3100 Hauptstraße 1")).toBeInTheDocument();
		expect(screen.getByText("Lieferung")).toBeInTheDocument();
		// 70 € Verkauf - 20 € Anzahlung
		expect(screen.getByText(/50,00/)).toBeInTheDocument();
	});
});
