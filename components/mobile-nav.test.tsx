import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

	it("explains that the Verkauf button is not ready yet", () => {
		render(<MobileNav />);

		fireEvent.click(screen.getByRole("button", { name: "Verkauf erfassen" }));

		expect(
			screen.getByText("Dieser Bereich ist noch in Arbeit."),
		).toBeInTheDocument();
	});
});
