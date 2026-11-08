import { describe, expect, it } from "vitest";
import { saisonUpdateSchema } from "./saison";

describe("saisonUpdateSchema", () => {
	it("does not inject active into an update", () => {
		const parsed = saisonUpdateSchema.parse({
			name: "Winter 2026",
			start_datum: "2026-10-01",
			end_datum: "2026-12-24",
		});

		expect("active" in parsed).toBe(false);
	});
});
