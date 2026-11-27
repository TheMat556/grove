import { describe, expect, it } from "vitest";
import { istSmsFaellig, smsTerminDatum } from "@/lib/sms";

const einstellungen = {
	sms_aktiv: true,
	sms_vorlauf_tage: 1,
	sms_uhrzeit: "08:00",
};

const reservierung = {
	versandart: "lieferung",
	status: "offen",
	geplantes_datum: "2026-12-10",
	kunde: { telefon: "+43 664 1234567" },
};

describe("smsTerminDatum", () => {
	it("zieht die Vorlaufzeit vom Lieferdatum ab", () => {
		expect(smsTerminDatum("2026-12-10", 1)).toBe("2026-12-09");
		expect(smsTerminDatum("2026-12-10", 0)).toBe("2026-12-10");
	});

	it("rechnet über Monats- und Jahresgrenzen", () => {
		expect(smsTerminDatum("2026-01-01", 3)).toBe("2025-12-29");
	});
});

describe("istSmsFaellig", () => {
	// Lieferung 10.12.2026, 1 Tag Vorlauf, 08:00 Berlin = 07:00 UTC (CET).
	it("wird erst am Termintag ab der eingestellten Uhrzeit fällig", () => {
		expect(
			istSmsFaellig(
				reservierung,
				einstellungen,
				new Date("2026-12-09T06:59:00Z"),
			),
		).toBe(false);
		expect(
			istSmsFaellig(
				reservierung,
				einstellungen,
				new Date("2026-12-09T07:00:00Z"),
			),
		).toBe(true);
	});

	it("bleibt nach dem Termin fällig", () => {
		expect(
			istSmsFaellig(
				reservierung,
				einstellungen,
				new Date("2026-12-10T12:00:00Z"),
			),
		).toBe(true);
	});

	it("ignoriert Abholungen, erledigte Reservierungen und deaktivierte SMS", () => {
		const jetzt = new Date("2026-12-10T12:00:00Z");
		expect(
			istSmsFaellig(
				{ ...reservierung, versandart: "abholung" },
				einstellungen,
				jetzt,
			),
		).toBe(false);
		expect(
			istSmsFaellig(
				{ ...reservierung, status: "erfuellt" },
				einstellungen,
				jetzt,
			),
		).toBe(false);
		expect(
			istSmsFaellig(
				{ ...reservierung, status: "storniert" },
				einstellungen,
				jetzt,
			),
		).toBe(false);
		expect(
			istSmsFaellig(
				reservierung,
				{ ...einstellungen, sms_aktiv: false },
				jetzt,
			),
		).toBe(false);
	});

	it("braucht eine Telefonnummer am Kunden", () => {
		const jetzt = new Date("2026-12-10T12:00:00Z");
		expect(
			istSmsFaellig({ ...reservierung, kunde: null }, einstellungen, jetzt),
		).toBe(false);
		expect(
			istSmsFaellig(
				{ ...reservierung, kunde: { telefon: "  " } },
				einstellungen,
				jetzt,
			),
		).toBe(false);
	});
});
