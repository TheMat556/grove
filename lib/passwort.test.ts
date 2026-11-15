import { describe, expect, it } from "vitest";
import { erzeugePasswort } from "@/lib/passwort";

describe("erzeugePasswort", () => {
	it("erzeugt ein 32-stelliges Hex-Passwort", () => {
		const passwort = erzeugePasswort();
		expect(passwort).toMatch(/^[0-9a-f]{32}$/);
	});

	it("liefert bei jedem Aufruf ein anderes Passwort", () => {
		expect(erzeugePasswort()).not.toBe(erzeugePasswort());
	});
});
