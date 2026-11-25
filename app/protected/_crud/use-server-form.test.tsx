import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useServerForm } from "./use-server-form";

type TestState = { success?: boolean; errors?: Record<string, string[]> };

describe("useServerForm", () => {
	it("löst onSuccess nur einmal pro Zustand aus, auch bei neuem Callback", async () => {
		const action = vi.fn().mockResolvedValue({ success: true });
		const onSuccess = vi.fn();
		const { result, rerender } = renderHook(
			({ callback }: { callback: (state: TestState) => void }) =>
				useServerForm<TestState>(action, {}, callback),
			{
				initialProps: {
					callback: onSuccess as (state: TestState) => void,
				},
			},
		);

		const form = document.createElement("form");
		const event = {
			preventDefault: vi.fn(),
			currentTarget: form,
		} as unknown as FormEvent<HTMLFormElement>;

		await act(async () => {
			result.current.formProps.onSubmit(event);
		});

		expect(onSuccess).toHaveBeenCalledTimes(1);

		// Parent rendert mit neuer Inline-Funktion: darf den Effekt nicht erneut
		// auslösen (sonst schließt der Dialog beim Wiederöffnen sofort).
		rerender({ callback: (state: TestState) => onSuccess(state) });
		expect(onSuccess).toHaveBeenCalledTimes(1);
	});

	it("sendet die FormData des Formulars an die Action", async () => {
		const action = vi.fn().mockResolvedValue({});
		const { result } = renderHook(() => useServerForm<TestState>(action, {}));

		const form = document.createElement("form");
		form.innerHTML = '<input name="name" value="Maria Huber" />';
		const event = {
			preventDefault: vi.fn(),
			currentTarget: form,
		} as unknown as FormEvent<HTMLFormElement>;

		await act(async () => {
			result.current.formProps.onSubmit(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(action).toHaveBeenCalledTimes(1);
		expect((action.mock.calls[0][1] as FormData).get("name")).toBe(
			"Maria Huber",
		);
	});
});
