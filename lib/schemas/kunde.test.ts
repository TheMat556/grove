import { describe, expect, it } from "vitest";
import { kundeInsertSchema } from "./kunde";

const gueltig = {
	name: "Familie Huber",
	telefon: "+43 664 1234567",
	plz: "3100",
	adresse: "Hauptstraße 1",
	ist_firma: false,
};

describe("kundeInsertSchema", () => {
	it("akzeptiert einen vollständigen Kunden und trimmt Textfelder", () => {
		const parsed = kundeInsertSchema.parse({ ...gueltig, name: "  Maria  " });
		expect(parsed.name).toBe("Maria");
	});

	it("lehnt leeren Namen und leere Adresse ab", () => {
		expect(kundeInsertSchema.safeParse({ ...gueltig, name: " " }).success).toBe(
			false,
		);
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, adresse: "" }).success,
		).toBe(false);
	});

	it("lehnt Telefonnummern mit weniger als 8 Ziffern ab", () => {
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, telefon: "" }).success,
		).toBe(false);
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, telefon: "+43 664 12" })
				.success,
		).toBe(false);
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, telefon: "abcdefgh" }).success,
		).toBe(false);
	});

	it("lehnt PLZ außerhalb 1000–9999 ab", () => {
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, plz: "999" }).success,
		).toBe(false);
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, plz: "12345" }).success,
		).toBe(false);
		expect(
			kundeInsertSchema.safeParse({ ...gueltig, plz: "0123" }).success,
		).toBe(false);
	});
});
