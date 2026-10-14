"use server";

import { updateProfil } from "@/lib/data/profil";
import { getCurrentProfil } from "@/lib/data/session";
import { profilInsertSchema } from "@/lib/schemas/profil";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ProfilFormState = EntityFormState;

/**
 * Die Rolle ist read-only und wird bewusst nicht aus dem Formular übernommen
 * (tb_profil.id == auth.users.id, kein Create/Delete – deshalb nur der
 * update-Baustein aus der Factory).
 */
const profilUpdateSchema = profilInsertSchema
	.partial()
	.pick({ name: true, telefon: true, aktiv: true });

const { updateAction: updateProfilAction } = createEntityActions({
	insertSchema: profilInsertSchema,
	updateSchema: profilUpdateSchema,
	mapInput: (formData) => ({
		name: formData.get("name"),
		telefon: formData.get("telefon") || null,
		aktiv: formData.get("aktiv") === "on",
	}),
	// Profilzeilen sind User-Konten: Admins dürfen alles, Mitarbeitende nur sich selbst.
	update: async (id, input) => {
		const current = await getCurrentProfil();
		if (current.rolle !== "admin" && current.id !== id) {
			throw new Error("Keine Berechtigung.");
		}
		return updateProfil(id, input);
	},
	labels: { singular: "Profil" },
	revalidatePath: "/protected/profile",
});

export { updateProfilAction };
