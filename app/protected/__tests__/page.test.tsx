import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/saison-context", () => ({
	getSaisonSelection: vi.fn(async () => ({
		saisons: [
			{
				id: "saison-1",
				name: "Winter 2026",
				start_datum: "2026-10-01",
				end_datum: "2026-12-24",
				active: true,
			},
		],
		selectedId: "saison-1",
	})),
}));

import { SaisonInfo } from "../page";

describe("SaisonInfo", () => {
	it("shows the selected saison", async () => {
		render(await SaisonInfo());

		expect(screen.getByText(/Winter 2026/)).toBeInTheDocument();
	});
});
