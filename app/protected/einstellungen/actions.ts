"use server";

import { revalidatePath } from "next/cache";
import { updateEinstellungen } from "@/lib/data/einstellungen";
import { getCurrentProfilId } from "@/lib/data/session";
import { einstellungenUpdateSchema } from "@/lib/schemas/einstellungen";
import type { EntityFormState } from "../_crud/entity-actions";

export type EinstellungenFormState = EntityFormState;

/** Speichert die globalen Einstellungen (SMS-Vorlaufzeit und -Uhrzeit). */
export async function updateEinstellungenAction(
	_prevState: EinstellungenFormState,
	formData: FormData,
): Promise<EinstellungenFormState> {
	const parsed = einstellungenUpdateSchema.safeParse({
		sms_aktiv: formData.get("sms_aktiv") === "on",
		sms_vorlauf_tage: formData.get("sms_vorlauf_tage"),
		sms_uhrzeit: formData.get("sms_uhrzeit"),
	});

	if (!parsed.success) {
		return {
			errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}

	try {
		// Anmeldung prüfen, zusätzlich zum Proxy – wie bei den CRUD-Actions.
		await getCurrentProfilId();
		await updateEinstellungen(parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Einstellungen konnten nicht gespeichert werden.",
		};
	}

	revalidatePath("/protected/einstellungen");
	// Das Dashboard zeigt die SMS-Konfiguration als Hinweis an.
	revalidatePath("/protected");
	return { success: true };
}
