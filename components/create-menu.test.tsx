import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreateMenu } from "./create-menu";

describe("CreateMenu", () => {
	it("listet alle anlegbaren Objekte mit Link auf ?neu=1", () => {
		render(<CreateMenu />);

		fireEvent.click(screen.getByRole("button", { name: "Neu anlegen" }));

		const erwartet = [
			["Saison", "/protected/saisons?neu=1"],
			["Stand", "/protected/staende?neu=1"],
			["Produkt", "/protected/produkte?neu=1"],
			["Kunde", "/protected/kunden?neu=1"],
			["Verkauf", "/protected/verkaeufe?neu=1"],
			["Reservierung", "/protected/reservierungen?neu=1"],
			["Preisempfehlung", "/protected/preisempfehlungen?neu=1"],
			["Profil", "/protected/profile?neu=1"],
		];

		for (const [name, href] of erwartet) {
			expect(screen.getByRole("menuitem", { name })).toHaveAttribute(
				"href",
				href,
			);
		}
	});
});
