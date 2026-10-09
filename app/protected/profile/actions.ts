"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProfil } from "@/lib/data/profil";
import { profilInsertSchema } from "@/lib/schemas/profil";
import type { EntityFormState } from "../_crud/entity-actions";

export type ProfilFormState = EntityFormState;

/**
 * Server Action: validiert die Formulardaten, aktualisiert das Profil
 * und leitet zurück zur Übersicht. Die Rolle ist read-only und wird
 * bewusst nicht aus dem Formular übernommen (tb_profil.id == auth.users.id,
 * kein Create/Delete).
 */
export async function updateProfilAction(
	_prevState: ProfilFormState,
	formData: FormData,
): Promise<ProfilFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Profil konnte nicht aktualisiert werden." };
	}

	// Nur die editierbaren Felder validieren; leeres Telefon -> null.
	const parsed = profilInsertSchema
		.partial()
		.pick({ name: true, telefon: true, aktiv: true })
		.safeParse({
			name: formData.get("name"),
			telefon: formData.get("telefon") || null,
			aktiv: formData.get("aktiv") === "on",
		});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await updateProfil(id, parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Profil konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/profile");
	redirect("/protected/profile");
}
