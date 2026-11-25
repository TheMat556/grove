"use server";

import { createProfilMitAuth, updateProfil } from "@/lib/data/profil";
import { getCurrentProfil } from "@/lib/data/session";
import { profilCreateSchema, profilInsertSchema } from "@/lib/schemas/profil";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ProfilFormState = EntityFormState;

/**
 * Die Rolle ist beim Bearbeiten read-only und wird bewusst nicht aus dem
 * Formular übernommen; angelegt wird sie beim Anlegen (profilCreateSchema).
 */
const profilUpdateSchema = profilInsertSchema
	.partial()
	.pick({ name: true, telefon: true, aktiv: true });

/**
 * Ein FormData-Mapping für beide Modi: Felder, die es im jeweiligen Modus nicht
 * gibt, liefert null und werden vom Schema verworfen.
 */
const mapInput = (formData: FormData) => ({
	name: formData.get("name"),
	telefon: formData.get("telefon") || null,
	aktiv: formData.get("aktiv") === "on",
	email: formData.get("email"),
	passwort: formData.get("passwort"),
	rolle: formData.get("rolle"),
});

const { createAction: createProfilAction, updateAction: updateProfilAction } =
	createEntityActions({
		insertSchema: profilCreateSchema,
		updateSchema: profilUpdateSchema,
		mapInput,
		// Profilzeilen sind User-Konten: nur Admins legen neue an.
		create: async (input) => {
			const current = await getCurrentProfil();
			if (current.rolle !== "admin") {
				throw new Error("Keine Berechtigung.");
			}
			return createProfilMitAuth(input);
		},
		// Admins dürfen alles, Mitarbeitende nur sich selbst.
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

export { createProfilAction, updateProfilAction };
