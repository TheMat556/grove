import { describe, expect, it } from "vitest";
import { googleMapsUrl } from "@/lib/maps";

describe("googleMapsUrl", () => {
	it("baut den Suchlink aus Kundenadresse und PLZ", () => {
		expect(googleMapsUrl({ adresse: "Hauptstraße 1", plz: "3100" })).toBe(
			"https://www.google.com/maps/search/?api=1&query=Hauptstra%C3%9Fe%201%2C%203100",
		);
	});

	it("nimmt den Ort mit, wenn er vorhanden ist (Standort)", () => {
		expect(
			googleMapsUrl({ adresse: "Waldweg 5", plz: 3100, ort: "St. Pölten" }),
		).toBe(
			"https://www.google.com/maps/search/?api=1&query=Waldweg%205%2C%203100%20St.%20P%C3%B6lten",
		);
	});

	it("liefert ohne Adresse keinen Link", () => {
		expect(googleMapsUrl(null)).toBeUndefined();
	});
});
