import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh }),
}));

vi.mock("@/components/ui/select", () => ({
	Select: ({
		value,
		onValueChange,
	}: {
		value: string;
		onValueChange: (value: string) => void;
	}) => (
		<div>
			<span data-testid="selected-value">{value}</span>
			<button type="button" onClick={() => onValueChange("saison-2")}>
				Saison B wählen
			</button>
		</div>
	),
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	SelectValue: () => null,
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	SelectItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { SaisonSelect } from "./saison-select";

afterEach(() => {
	refresh.mockClear();
	// biome-ignore lint/suspicious/noDocumentCookie: Test räumt das Cookie auf.
	document.cookie = "saison_id=; path=/; max-age=0";
});

describe("SaisonSelect", () => {
	it("shows the new saison immediately after a change", () => {
		render(
			<SaisonSelect
				saisons={[
					{ id: "saison-1", name: "Saison A" },
					{ id: "saison-2", name: "Saison B" },
				]}
				selectedId="saison-1"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Saison B wählen" }));

		expect(screen.getByTestId("selected-value")).toHaveTextContent("saison-2");
		expect(refresh).toHaveBeenCalled();
		expect(document.cookie).toContain("saison_id=saison-2");
	});
});
