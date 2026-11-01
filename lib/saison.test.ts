import { describe, expect, it } from "vitest";
import { defaultSaison, istAktiv, type Saison } from "./saison";

function saison(
	id: string,
	start: string,
	end: string,
	active = false,
): Saison {
	return { id, name: id, start_datum: start, end_datum: end, active };
}

describe("istAktiv", () => {
	const now = new Date(2026, 9, 19); // 2026-10-19

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

describe("defaultSaison", () => {
	const now = new Date(2026, 9, 19);
	const alt = saison("alt", "2025-10-01", "2025-12-24");
	const bald = saison("bald", "2026-10-01", "2026-12-24");

	it("nimmt die per Flag aktive Saison", () => {
		expect(defaultSaison([{ ...alt, active: true }, bald], now)?.id).toBe(
			"alt",
		);
	});

	it("fällt ohne Flag auf die laufende Saison zurück", () => {
		expect(defaultSaison([alt, bald], now)?.id).toBe("bald");
	});

	it("fällt sonst auf die zuletzt gestartete Saison zurück", () => {
		const zukunft = saison("zukunft", "2027-10-01", "2027-12-24");
		expect(defaultSaison([alt, zukunft], now)?.id).toBe("zukunft");
	});

	it("gibt ohne Saisons undefined zurück", () => {
		expect(defaultSaison([], now)).toBeUndefined();
	});
});
