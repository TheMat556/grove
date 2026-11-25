import { describe, expect, it } from "vitest";
import { uuidSchema } from "./common";

describe("uuidSchema", () => {
	it("akzeptiert DB-gültige UUIDs, auch die Seed-Dev-User-ID", () => {
		expect(
			uuidSchema.safeParse("00000000-0000-4000-8000-000000000001").success,
		).toBe(true);
		expect(
			uuidSchema.safeParse("3f2504e0-4f89-41d3-9a0c-0305e82c3301").success,
		).toBe(true);
	});

	it("lehnt Nicht-UUIDs ab", () => {
		expect(uuidSchema.safeParse("profil-1").success).toBe(false);
		expect(uuidSchema.safeParse("").success).toBe(false);
	});
});
