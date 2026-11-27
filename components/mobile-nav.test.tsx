import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NEU_DIALOG_EVENT } from "@/lib/neu-dialog";

const { currentPath } = vi.hoisted(() => ({
	currentPath: { value: "/protected/kunden" },
}));

vi.mock("next/navigation", () => ({
	usePathname: () => currentPath.value,
}));

import { MobileNav } from "./mobile-nav";

describe("MobileNav", () => {
	it("marks only the current section as active", () => {
		currentPath.value = "/protected/kunden";
		render(<MobileNav />);

		expect(screen.getByRole("link", { name: "Kunden" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "Verkäufe" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("links to the settings page", () => {
		render(<MobileNav />);

		expect(screen.getByRole("link", { name: "Einstellungen" })).toHaveAttribute(
			"href",
			"/protected/einstellungen",
		);
	});

	it("hat einen zentralen Plus-Button für neue Verkäufe", () => {
		render(<MobileNav />);

		expect(
			screen.getByRole("link", { name: "Verkauf erfassen" }),
		).toHaveAttribute("href", "/protected/verkaeufe?neu=1");
	});

	it("öffnet auf der Verkäufe-Seite den Dialog per Event statt zu navigieren", () => {
		currentPath.value = "/protected/verkaeufe";
		const handler = vi.fn();
		window.addEventListener(NEU_DIALOG_EVENT, handler);
		render(<MobileNav />);

		fireEvent.click(screen.getByRole("link", { name: "Verkauf erfassen" }));

		expect(handler).toHaveBeenCalledTimes(1);
		window.removeEventListener(NEU_DIALOG_EVENT, handler);
	});
});
