import { render, screen } from "@testing-library/react";
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

	it("renders Einstellungen as non-interactive placeholder", () => {
		render(<MobileNav />);

		expect(
			screen.queryByRole("link", { name: "Verkauf erfassen" }),
		).not.toBeInTheDocument();
		expect(screen.getByText("Einstellungen")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Einstellungen/ }),
		).not.toBeInTheDocument();
	});
});
