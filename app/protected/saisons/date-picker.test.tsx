import { fireEvent, render, screen } from "@testing-library/react";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/popover", () => ({
	Popover: ({ children }: { children: ReactNode }) => <>{children}</>,
	PopoverTrigger: ({
		render,
		children,
	}: {
		render: ReactElement;
		children: ReactNode;
	}) => cloneElement(render, {}, children),
	PopoverContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/calendar", () => ({
	Calendar: ({ onSelect }: { onSelect: (value: Date | undefined) => void }) => (
		<button type="button" onClick={() => onSelect(undefined)}>
			Clear date
		</button>
	),
}));

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
	it("keeps the current date when the calendar reports no selection", () => {
		const { container } = render(
			<DatePicker id="start" name="start_datum" defaultValue="2026-10-01" />,
		);
		const input = container.querySelector('input[name="start_datum"]');

		expect(input).toHaveValue("2026-10-01");

		fireEvent.click(screen.getByRole("button", { name: "Clear date" }));

		expect(input).toHaveValue("2026-10-01");
	});
});
