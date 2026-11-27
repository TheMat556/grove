import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UmsatzProStandCard } from "./umsatz-pro-stand";

const daten = {
	heute: [{ standId: "a", stand: "Heute-Stand", umsatz: 100, anzahl: 1 }],
	dreiTage: [
		{ standId: "a", stand: "Drei-Tage-Stand", umsatz: 150, anzahl: 2 },
	],
	woche: [{ standId: "a", stand: "Wochen-Stand", umsatz: 200, anzahl: 3 }],
	gesamt: [{ standId: "a", stand: "Saison-Stand", umsatz: 900, anzahl: 9 }],
};

describe("UmsatzProStandCard", () => {
	it("zeigt standardmäßig die letzte Woche und filtert per Select", () => {
		render(<UmsatzProStandCard daten={daten} />);

		expect(screen.getByText("Wochen-Stand")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Zeitraum"), {
			target: { value: "heute" },
		});

		expect(screen.getByText("Heute-Stand")).toBeInTheDocument();
		expect(screen.queryByText("Wochen-Stand")).not.toBeInTheDocument();
	});

	it("zeigt einen Hinweis, wenn der Zeitraum keine Verkäufe hat", () => {
		render(
			<UmsatzProStandCard
				daten={{ ...daten, heute: [], dreiTage: [], woche: [], gesamt: [] }}
			/>,
		);

		expect(
			screen.getByText("Keine Verkäufe in diesem Zeitraum."),
		).toBeInTheDocument();
	});
});
