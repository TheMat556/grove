import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	usePathname: () => "/protected",
	useSearchParams: () => new URLSearchParams(),
}));

import { DashboardStandFilter } from "./dashboard-stand-filter";

const staende = [
	{ id: "a", bezeichnung: "Stand A" },
	{ id: "b", bezeichnung: "Stand B" },
];

describe("DashboardStandFilter", () => {
	it("setzt den Stand als URL-Parameter und entfernt ihn bei 'Alle Stände'", () => {
		render(<DashboardStandFilter staende={staende} />);

		fireEvent.change(screen.getByLabelText("Stand"), {
			target: { value: "b" },
		});
		expect(push).toHaveBeenLastCalledWith("/protected?stand=b");

		fireEvent.change(screen.getByLabelText("Stand"), {
			target: { value: "alle" },
		});
		expect(push).toHaveBeenLastCalledWith("/protected");
	});

	it("zeigt den aktuell gefilterten Stand an", () => {
		render(<DashboardStandFilter staende={staende} selectedId="b" />);

		expect(screen.getByLabelText("Stand")).toHaveValue("b");
	});
});
