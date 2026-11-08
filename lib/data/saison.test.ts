import { describe, expect, it } from "vitest";
import { toFriendlySaisonError } from "./saison";

describe("toFriendlySaisonError", () => {
	it("maps the overlap constraint to a readable message", () => {
		const error = new Error(
			'new row for relation "tb_saison" violates exclusion constraint "saison_zeitraum_ueberlappt_nicht"',
		);

		expect(toFriendlySaisonError(error).message).toBe(
			"Der Zeitraum überschneidet sich mit einer bestehenden Saison.",
		);
	});

	it("passes other errors through unchanged", () => {
		const error = new Error("DB kaputt");

		expect(toFriendlySaisonError(error)).toBe(error);
	});
});
