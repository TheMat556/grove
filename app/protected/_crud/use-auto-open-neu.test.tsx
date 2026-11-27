import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NEU_DIALOG_EVENT } from "@/lib/neu-dialog";
import { useAutoOpenNeu } from "./use-auto-open-neu";

function TestDialog({ enabled = true }: { enabled?: boolean }) {
	const [open] = useAutoOpenNeu({ enabled });
	return <p>{open ? "offen" : "geschlossen"}</p>;
}

afterEach(() => {
	window.history.replaceState({}, "", "/protected");
});

describe("useAutoOpenNeu", () => {
	it("öffnet bei ?neu=1 automatisch", async () => {
		window.history.replaceState({}, "", "/protected/produkte?neu=1");
		render(<TestDialog />);

		expect(await screen.findByText("offen")).toBeInTheDocument();
	});

	it("bleibt ohne ?neu=1 geschlossen", () => {
		window.history.replaceState({}, "", "/protected/produkte");
		render(<TestDialog />);

		expect(screen.getByText("geschlossen")).toBeInTheDocument();
	});

	it("öffnet über das Plus-Event (gleiche Seite, keine Navigation)", async () => {
		render(<TestDialog />);

		act(() => {
			window.dispatchEvent(new Event(NEU_DIALOG_EVENT));
		});

		expect(await screen.findByText("offen")).toBeInTheDocument();
	});

	it("ignoriert ?neu=1, wenn der Dialog nicht fürs Anlegen ist", () => {
		window.history.replaceState({}, "", "/protected/produkte?neu=1");
		render(<TestDialog enabled={false} />);

		act(() => {
			window.dispatchEvent(new Event(NEU_DIALOG_EVENT));
		});

		expect(screen.getByText("geschlossen")).toBeInTheDocument();
	});
});
