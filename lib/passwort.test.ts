import { describe, expect, it } from "vitest";
import { erzeugePasswort } from "@/lib/passwort";

describe("erzeugePasswort", () => {
	it("erzeugt ein 16-stelliges base64url-Passwort", () => {
		const passwort = erzeugePasswort();
		expect(passwort).toMatch(/^[A-Za-z0-9_-]{16}$/);
	});

	it("liefert bei jedem Aufruf ein anderes Passwort", () => {
		expect(erzeugePasswort()).not.toBe(erzeugePasswort());
	});
});
