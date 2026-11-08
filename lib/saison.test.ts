import { describe, expect, it } from "vitest";
import {
	defaultSaison,
	istAktiv,
	parseIsoDate,
	type Saison,
	toIsoDate,
	toLocalIsoDate,
} from "./saison";

function saison(id: string, start: string, end: string): Saison {
	return { id, name: id, start_datum: start, end_datum: end, active: false };
}

describe("istAktiv", () => {
	const now = new Date("2026-10-19T12:00:00+02:00"); // 2026-10-19 in Berlin

	it("ist aktiv innerhalb des Zeitraums", () => {
		expect(istAktiv("2026-10-01", "2026-12-24", now)).toBe(true);
	});

	it("ist an beiden Grenztagen aktiv", () => {
		expect(istAktiv("2026-10-19", "2026-12-24", now)).toBe(true);
		expect(istAktiv("2026-10-01", "2026-10-19", now)).toBe(true);
	});

	it("ist außerhalb des Zeitraums inaktiv", () => {
		expect(istAktiv("2026-11-01", "2026-12-24", now)).toBe(false);
		expect(istAktiv("2026-01-01", "2026-02-01", now)).toBe(false);
	});
});

describe("Datumsumwandlung", () => {
	it("rechnet in der Zeitzone des Betriebs", () => {
		expect(toIsoDate(new Date("2026-10-19T22:30:00Z"))).toBe("2026-10-20");
		expect(toIsoDate(new Date("2026-10-19T10:00:00Z"))).toBe("2026-10-19");
	});

	it("formatiert Browser-Daten unabhängig von der Zeitzone", () => {
		expect(toLocalIsoDate(new Date(2026, 9, 1))).toBe("2026-10-01");
	});

	it("liest ISO-Daten als lokale Mitternacht", () => {
		const date = parseIsoDate("2026-10-01");
		expect(date?.getFullYear()).toBe(2026);
		expect(date?.getMonth()).toBe(9);
		expect(date?.getDate()).toBe(1);
		expect(parseIsoDate("kein-datum")).toBeUndefined();
	});
});

describe("defaultSaison", () => {
	const now = new Date("2026-10-19T12:00:00+02:00");
	const alt = saison("alt", "2025-10-01", "2025-12-24");
	const bald = saison("bald", "2026-10-01", "2026-12-24");
	const frueh = saison("frueh", "2026-09-01", "2026-12-31");
	const zukunft = saison("zukunft", "2027-10-01", "2027-12-24");

	it("nimmt die laufende Saison", () => {
		expect(defaultSaison([alt, bald], now)?.id).toBe("bald");
	});

	it("nimmt bei Überschneidung die früher gestartete laufende Saison", () => {
		expect(defaultSaison([bald, frueh], now)?.id).toBe("frueh");
	});

	it("ignoriert das Flag active", () => {
		expect(defaultSaison([frueh, { ...bald, active: true }], now)?.id).toBe(
			"frueh",
		);
		expect(defaultSaison([{ ...alt, active: true }, bald], now)?.id).toBe(
			"bald",
		);
	});

	it("fällt ohne laufende Saison auf die zuletzt gestartete zurück", () => {
		expect(defaultSaison([alt, zukunft], now)?.id).toBe("zukunft");
	});

	it("gibt ohne Saisons undefined zurück", () => {
		expect(defaultSaison([], now)).toBeUndefined();
	});
});
