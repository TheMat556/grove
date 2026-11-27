import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { toIsoDate } from "@/lib/saison";
import type { UmsatzVerkauf } from "@/lib/umsatz";
import { UmsatzProStandCard } from "./umsatz-pro-stand";

const heute = toIsoDate(new Date());
const vorFuenfTagen = toIsoDate(new Date(Date.now() - 5 * 86_400_000));

const verkaeufe: UmsatzVerkauf[] = [
	{
		stand_id: "a",
		stand: "Heute-Stand",
		verkauft_am: `${heute}T10:00:00Z`,
		preis_gesamt: 100,
	},
	{
		stand_id: "b",
		stand: "Wochen-Stand",
		verkauft_am: `${vorFuenfTagen}T10:00:00Z`,
		preis_gesamt: 200,
	},
];

describe("UmsatzProStandCard", () => {
	it("zeigt standardmäßig die letzte Woche und filtert per Select", () => {
		render(<UmsatzProStandCard verkaeufe={verkaeufe} />);

		expect(screen.getByText("Wochen-Stand")).toBeInTheDocument();
		expect(screen.getByText("Heute-Stand")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Zeitraum"), {
			target: { value: "heute" },
		});

		expect(screen.getByText("Heute-Stand")).toBeInTheDocument();
		expect(screen.queryByText("Wochen-Stand")).not.toBeInTheDocument();
	});

	it("zeigt einen Hinweis, wenn der Zeitraum keine Verkäufe hat", () => {
		render(<UmsatzProStandCard verkaeufe={[]} />);

		expect(
			screen.getByText("Keine Verkäufe in diesem Zeitraum."),
		).toBeInTheDocument();
	});
});
