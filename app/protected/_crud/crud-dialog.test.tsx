import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrudDialog } from "./crud-dialog";

describe("CrudDialog", () => {
	it("übergibt ein stabiles close über Re-Renders", () => {
		const closings: Array<() => void> = [];
		const form = (close: () => void) => {
			closings.push(close);
			return <div />;
		};
		const ui = () => (
			<CrudDialog
				trigger={<button type="button">Öffnen</button>}
				title="Test"
				description="Test"
			>
				{form}
			</CrudDialog>
		);

		const { rerender } = render(ui());
		rerender(ui());

		// Die Formulare laufen mit [state.success, onSuccess] als Effekt-Deps:
		// Ein neues close würde sie direkt nach dem Wiederöffnen erneut schließen.
		expect(closings.length).toBeGreaterThanOrEqual(2);
		expect(new Set(closings).size).toBe(1);
	});

	it("öffnet bei ?neu=1 automatisch (Plus-Menü)", async () => {
		window.history.replaceState({}, "", "/protected/produkte?neu=1");
		render(
			<CrudDialog
				autoOpenNeu
				trigger={<button type="button">Öffnen</button>}
				title="Vom Plus-Menü"
				description="Test"
			>
				{() => <div />}
			</CrudDialog>,
		);

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		window.history.replaceState({}, "", "/protected");
	});

	it("startet mit defaultOpen direkt geöffnet (Deep-Link vom Plus-Button)", async () => {
		render(
			<CrudDialog
				defaultOpen
				trigger={<button type="button">Öffnen</button>}
				title="Direkt offen"
				description="Test"
			>
				{() => <div />}
			</CrudDialog>,
		);

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Direkt offen")).toBeInTheDocument();
	});
});
