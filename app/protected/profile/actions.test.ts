import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, redirect } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

const { updateProfil, getCurrentProfil } = vi.hoisted(() => ({
	updateProfil: vi.fn(async () => ({})),
	getCurrentProfil: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/data/profil", () => ({ updateProfil }));
vi.mock("@/lib/data/session", () => ({ getCurrentProfil }));

import { updateProfilAction } from "./actions";

function formDataOf(entries: Record<string, string> = {}): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.set(key, value);
	}
	return fd;
}

const vollerDatensatz = formDataOf({
	id: "profil-2",
	name: "Neuer Name",
	telefon: "+43 664 000",
});

describe("updateProfilAction – Rollen-Guard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("verbietet Mitarbeiter das Ändern fremder Profile", async () => {
		getCurrentProfil.mockResolvedValue({
			id: "profil-1",
			rolle: "mitarbeiter",
		});
		const state = await updateProfilAction({}, vollerDatensatz);
		expect(state.message).toBe("Keine Berechtigung.");
		expect(updateProfil).not.toHaveBeenCalled();
	});

	it("erlaubt Mitarbeitern das Ändern des eigenen Profils", async () => {
		getCurrentProfil.mockResolvedValue({
			id: "profil-2",
			rolle: "mitarbeiter",
		});
		await updateProfilAction({}, vollerDatensatz);
		expect(updateProfil).toHaveBeenCalledWith(
			"profil-2",
			expect.objectContaining({ name: "Neuer Name" }),
		);
	});

	it("erlaubt Admins das Ändern fremder Profile", async () => {
		getCurrentProfil.mockResolvedValue({ id: "profil-1", rolle: "admin" });
		await updateProfilAction({}, vollerDatensatz);
		expect(updateProfil).toHaveBeenCalledWith(
			"profil-2",
			expect.objectContaining({ name: "Neuer Name" }),
		);
	});
});
