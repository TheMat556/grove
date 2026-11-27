import { describe, expect, it } from "vitest";
import { type UmsatzVerkauf, umsatzProStand } from "@/lib/umsatz";

const jetzt = new Date("2026-11-27T12:00:00Z");

const verkauf = (
	standId: string,
	stand: string,
	verkauftAm: string,
	preis: number,
): UmsatzVerkauf => ({
	stand_id: standId,
	stand,
	verkauft_am: verkauftAm,
	preis_gesamt: preis,
});

const verkaeufe = [
	verkauf("a", "Stand A", "2026-11-27T10:00:00Z", 100),
	verkauf("a", "Stand A", "2026-11-26T10:00:00Z", 50),
	verkauf("b", "Stand B", "2026-11-25T10:00:00Z", 30),
	verkauf("b", "Stand B", "2026-11-20T10:00:00Z", 999),
];

describe("umsatzProStand", () => {
	it("zählt heute nur heutige Verkäufe und sortiert absteigend", () => {
		expect(umsatzProStand(verkaeufe, "heute", jetzt)).toEqual([
			{ standId: "a", stand: "Stand A", umsatz: 100, anzahl: 1 },
		]);
	});

	it("umfasst bei den letzten 3 Tagen heute + 2 Tage davor", () => {
		expect(umsatzProStand(verkaeufe, "dreiTage", jetzt)).toEqual([
			{ standId: "a", stand: "Stand A", umsatz: 150, anzahl: 2 },
			{ standId: "b", stand: "Stand B", umsatz: 30, anzahl: 1 },
		]);
	});

	it("umfasst bei der letzten Woche 7 Kalendertage inklusive heute", () => {
		expect(umsatzProStand(verkaeufe, "woche", jetzt)).toEqual([
			{ standId: "a", stand: "Stand A", umsatz: 150, anzahl: 2 },
			{ standId: "b", stand: "Stand B", umsatz: 30, anzahl: 1 },
		]);
	});

	it("summiert bei der gesamten Saison alle Verkäufe", () => {
		expect(umsatzProStand(verkaeufe, "gesamt", jetzt)).toEqual([
			{ standId: "b", stand: "Stand B", umsatz: 1029, anzahl: 2 },
			{ standId: "a", stand: "Stand A", umsatz: 150, anzahl: 2 },
		]);
	});

	it("ordnet Verkäufe nach dem Berlin-Kalender zu", () => {
		// 2026-11-26T23:30Z ist in Berlin (CET) schon der 27.11. um 00:30.
		const nachMitternacht = [
			verkauf("a", "Stand A", "2026-11-26T23:30:00Z", 10),
		];

		expect(umsatzProStand(nachMitternacht, "heute", jetzt)).toHaveLength(1);
	});
});
