import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, redirect } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { createEntityActions } from "./entity-actions";

// Zod-Ersatz: die Factory verlangt nur safeParse → { success, data | error }.
type FakeResult =
	| { success: true; data: unknown }
	| {
			success: false;
			error: { flatten: () => { fieldErrors: Record<string, string[]> } };
	  };

function fakeSchema(result: FakeResult) {
	return { safeParse: vi.fn(() => result) };
}

function fieldError(field: string, message: string) {
	return fakeSchema({
		success: false,
		error: {
			flatten: () => ({ fieldErrors: { [field]: [message] } }),
		},
	}) as never;
}

type ConfigOverrides = {
	insertSchema?: unknown;
	create?: (input: unknown) => Promise<unknown>;
	update?: (id: string, input: unknown) => Promise<unknown>;
	remove?: (id: string) => Promise<void>;
};

function makeConfig(overrides: ConfigOverrides = {}) {
	const config = {
		insertSchema: fakeSchema({ success: true, data: { feld: "x" } }),
		mapInput: (formData: FormData) => ({ feld: formData.get("feld") }),
		create: vi.fn(async () => ({})),
		update: vi.fn(async () => ({})),
		remove: vi.fn(async () => {}),
		labels: { singular: "Test" },
		revalidatePath: "/test",
		...overrides,
	};
	return { config, actions: createEntityActions(config as never) };
}

describe("createEntityActions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createAction", () => {
		it("returns field errors when the schema rejects", async () => {
			const { actions, config } = makeConfig({
				insertSchema: fieldError("name", "Pflichtfeld"),
			});
			const state = await actions.createAction({}, formDataOf());
			expect(state).toEqual({ errors: { name: ["Pflichtfeld"] } });
			expect(config.create).not.toHaveBeenCalled();
		});

		it("creates with parsed data, revalidates and reports success", async () => {
			const { actions, config } = makeConfig();
			const state = await actions.createAction({}, formDataOf());
			expect(config.create).toHaveBeenCalledWith({ feld: "x" });
			expect(revalidatePath).toHaveBeenCalledWith("/test");
			expect(state).toEqual({ success: true });
		});

		it("maps thrown errors to the message field", async () => {
			const { actions } = makeConfig({
				create: async () => {
					throw new Error("DB kaputt");
				},
			});
			const state = await actions.createAction({}, formDataOf());
			expect(state).toEqual({ message: "DB kaputt" });
			expect(revalidatePath).not.toHaveBeenCalled();
		});
	});

	describe("updateAction", () => {
		it("fails without an id", async () => {
			const { actions, config } = makeConfig();
			const state = await actions.updateAction({}, formDataOf());
			expect(state.message).toBeTruthy();
			expect(config.update).not.toHaveBeenCalled();
		});

		it("updates with parsed data and redirects", async () => {
			const { actions, config } = makeConfig();
			const state = await actions.updateAction({}, formDataOf({ id: "abc" }));
			expect(config.update).toHaveBeenCalledWith("abc", { feld: "x" });
			expect(revalidatePath).toHaveBeenCalledWith("/test");
			expect(redirect).toHaveBeenCalledWith("/test");
			expect(state).toBeUndefined();
		});

		it("maps update errors to the message field", async () => {
			const { actions } = makeConfig({
				update: async () => {
					throw new Error("FK-Verstoß");
				},
			});
			const state = await actions.updateAction({}, formDataOf({ id: "abc" }));
			expect(state.message).toBe("FK-Verstoß");
		});
	});

	describe("deleteAction", () => {
		it("deletes and revalidates", async () => {
			const { actions, config } = makeConfig();
			await actions.deleteAction(formDataOf({ id: "abc" }));
			expect(config.remove).toHaveBeenCalledWith("abc");
			expect(revalidatePath).toHaveBeenCalledWith("/test");
		});

		it("does nothing without an id", async () => {
			const { actions, config } = makeConfig();
			await actions.deleteAction(formDataOf());
			expect(config.remove).not.toHaveBeenCalled();
		});

		it("propagates FK errors (Error-Boundary entscheidet)", async () => {
			const { actions } = makeConfig({
				remove: async () => {
					throw new Error("FK");
				},
			});
			await expect(
				actions.deleteAction(formDataOf({ id: "abc" })),
			).rejects.toThrow("FK");
		});
	});
});

function formDataOf(entries: Record<string, string> = {}): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.set(key, value);
	}
	fd.set("feld", "x");
	return fd;
}
