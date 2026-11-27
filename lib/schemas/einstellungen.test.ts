import { describe, expect, it } from "vitest";
import { einstellungenUpdateSchema } from "@/lib/schemas/einstellungen";

const gueltig = {
	sms_aktiv: true,
	sms_vorlauf_tage: "2",
	sms_uhrzeit: "08:00",
};

describe("einstellungenUpdateSchema", () => {
	it("parst die Formularwerte", () => {
		expect(einstellungenUpdateSchema.parse(gueltig)).toEqual({
			sms_aktiv: true,
			sms_vorlauf_tage: 2,
			sms_uhrzeit: "08:00",
		});
	});

	it("lehnt leere oder unplausible Vorlaufzeiten ab", () => {
		for (const wert of ["", "-1", "31", "2.5", "abc"]) {
			expect(
				einstellungenUpdateSchema.safeParse({
					...gueltig,
					sms_vorlauf_tage: wert,
				}).success,
			).toBe(false);
		}
	});

	it("lehnt ungültige Uhrzeiten ab", () => {
		for (const wert of ["", "25:00", "8:00", "08:60"]) {
			expect(
				einstellungenUpdateSchema.safeParse({ ...gueltig, sms_uhrzeit: wert })
					.success,
			).toBe(false);
		}
	});
});
