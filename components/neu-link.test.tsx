import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NEU_DIALOG_EVENT } from "@/lib/neu-dialog";

const { pathname } = vi.hoisted(() => ({ pathname: { value: "/protected" } }));

vi.mock("next/navigation", () => ({
	usePathname: () => pathname.value,
}));

import { NeuLink } from "./neu-link";

function mitEventSpy() {
	const handler = vi.fn();
	window.addEventListener(NEU_DIALOG_EVENT, handler);
	return handler;
}

describe("NeuLink", () => {
	it("öffnet auf der eigenen Seite den Dialog per Event statt zu navigieren", () => {
		pathname.value = "/protected/verkaeufe";
		const handler = mitEventSpy();
		render(
			<NeuLink href="/protected/verkaeufe?neu=1">Verkauf erfassen</NeuLink>,
		);

		fireEvent.click(screen.getByRole("link", { name: "Verkauf erfassen" }));

		expect(handler).toHaveBeenCalledTimes(1);
		window.removeEventListener(NEU_DIALOG_EVENT, handler);
	});

	it("lässt normale Navigation auf andere Seiten zu", () => {
		pathname.value = "/protected";
		const handler = mitEventSpy();
		render(
			<NeuLink href="/protected/verkaeufe?neu=1">Verkauf erfassen</NeuLink>,
		);

		fireEvent.click(screen.getByRole("link", { name: "Verkauf erfassen" }));

		expect(handler).not.toHaveBeenCalled();
		window.removeEventListener(NEU_DIALOG_EVENT, handler);
	});
});
