import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReservierungMitDetails } from "@/lib/data/reservierung";
import { ReservierungUebersichtDialog } from "./reservierung-uebersicht-dialog";

const reservierung = {
	id: "22222222-2222-4222-8222-222222222222",
	geplantes_datum: "2026-12-01",
	versandart: "lieferung",
	status: "offen",
	anzahlungsbetrag: 20,
	anmerkung: "Bitte morgens liefern",
	reserviert_am: "2026-11-21T09:00:00.000Z",
	stand: { bezeichnung: "Stand Nord" },
	kunde: {
		name: "Familie Huber",
		plz: "3100",
		adresse: "Hauptstraße 1",
		telefon: "+43 664 1234567",
	},
} as ReservierungMitDetails;

describe("ReservierungUebersichtDialog", () => {
	it("zeigt Kunde mit Adresse, Stand, Versand und Status", () => {
		render(
			<ReservierungUebersichtDialog
				reservierung={reservierung}
				trigger={<button type="button">Ansehen</button>}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Ansehen" }));

		expect(screen.getByText(/Reservierung: Familie Huber/)).toBeInTheDocument();
		expect(screen.getByText("Familie Huber")).toBeInTheDocument();
		expect(screen.getByText("3100 Hauptstraße 1")).toBeInTheDocument();
		expect(screen.getByText("+43 664 1234567")).toBeInTheDocument();
		expect(screen.getByText("Stand Nord")).toBeInTheDocument();
		expect(screen.queryByText("Stand-Adresse")).not.toBeInTheDocument();
		// Die Kundenadresse ist der Google-Maps-Link, nicht die Stand-Adresse.
		expect(
			screen.getByRole("link", { name: "3100 Hauptstraße 1" }),
		).toHaveAttribute(
			"href",
			expect.stringContaining("google.com/maps/search"),
		);
		expect(screen.getByText("Lieferung")).toBeInTheDocument();
		expect(screen.getByText("Offen")).toBeInTheDocument();
		expect(screen.getByText(/20,00/)).toBeInTheDocument();
		expect(screen.getByText("Bitte morgens liefern")).toBeInTheDocument();
	});
});
