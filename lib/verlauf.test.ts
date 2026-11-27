import { describe, expect, it } from "vitest";
import { zaehlungenProTag } from "@/lib/verlauf";

const jetzt = new Date("2026-11-27T12:00:00Z");

describe("zaehlungenProTag", () => {
	it("zählt Ereignisse pro Tag und füllt Lücken mit 0", () => {
		expect(
			zaehlungenProTag(
				[
					"2026-11-25T10:00:00Z",
					"2026-11-27T08:00:00Z",
					"2026-11-27T16:00:00Z",
					"2026-11-01T08:00:00Z",
				],
				3,
				jetzt,
			),
		).toEqual([1, 0, 2]);
	});

	it("ordnet Zeitstempel nach dem Berlin-Kalender zu, nicht nach UTC", () => {
		// 2026-11-26T23:30Z ist in Berlin (CET) schon der 27.11. um 00:30.
		expect(zaehlungenProTag(["2026-11-26T23:30:00Z"], 2, jetzt)).toEqual([
			0, 1,
		]);
	});

	it("zählt reine ISO-Datumsangaben (z. B. geplantes Lieferdatum) mit", () => {
		expect(zaehlungenProTag(["2026-11-26", "2026-11-26"], 2, jetzt)).toEqual([
			2, 0,
		]);
	});
});
