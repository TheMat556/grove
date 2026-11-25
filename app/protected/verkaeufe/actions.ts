"use server";

import { revalidatePath } from "next/cache";
import {
	createVerkaufMitPositionen,
	deleteVerkaufMitPositionen,
	updateVerkaufMitPositionen,
} from "@/lib/data/verkauf";
import { uuidSchema } from "@/lib/schemas/common";
import {
	preisGesamt,
	type VerkaufFormInput,
	verkaufFormSchema,
} from "@/lib/schemas/verkauf";
import type { Tables } from "@/lib/supabase/database.types";
import type { EntityFormState } from "../_crud/entity-actions";

/** Zustand der Verkauf-Formulare: Erfolg plus gespeicherter Verkauf. */
export type VerkaufFormState = EntityFormState & {
	/** Gespeicherter Verkauf für Reservierungsschritt und „Zurück zum Verkauf". */
	verkauf?: Tables<"tb_verkauf">;
	/** Validierte Positionen des gespeicherten Verkaufs. */
	positionen?: VerkaufFormInput["positionen"];
};

type VerkaufParsed =
	| { ok: true; data: VerkaufFormInput }
	| { ok: false; state: VerkaufFormState };

/** Gemeinsames Parsen von Kopf + Positionen für Anlegen und Bearbeiten. */
function parseVerkaufForm(formData: FormData): VerkaufParsed {
	let positionen: unknown;
	try {
		positionen = JSON.parse(String(formData.get("positionen") ?? "[]"));
	} catch {
		return {
			ok: false,
			state: { message: "Positionen konnten nicht gelesen werden." },
		};
	}

	const parsed = verkaufFormSchema.safeParse({
		saison_id: formData.get("saison_id"),
		stand_id: formData.get("stand_id"),
		aktion_bz: formData.get("aktion_bz") || null,
		anmerkung: formData.get("anmerkung") || null,
		positionen,
	});

	if (!parsed.success) {
		return {
			ok: false,
			state: {
				errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
			},
		};
	}

	return { ok: true, data: parsed.data };
}

/**
 * Legt einen Verkauf inkl. Positionen an. profil_id und preis_gesamt werden
 * serverseitig bestimmt (Summe der Positionen), nicht vom Client übernommen.
 */
async function createVerkaufAction(
	_prevState: VerkaufFormState,
	formData: FormData,
): Promise<VerkaufFormState> {
	const parsed = parseVerkaufForm(formData);
	if (!parsed.ok) return parsed.state;

	const { positionen, ...kopf } = parsed.data;

	try {
		const verkauf = await createVerkaufMitPositionen(
			{ ...kopf, reservierung_id: null, preis_gesamt: preisGesamt(positionen) },
			positionen,
		);
		revalidatePath("/protected/verkaeufe");
		return { success: true, verkauf, positionen };
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Verkauf konnte nicht angelegt werden.",
		};
	}
}

/** Ändert Kopf (Stand, Aktion, Anmerkung) und ersetzt die Positionen. */
async function updateVerkaufAction(
	_prevState: VerkaufFormState,
	formData: FormData,
): Promise<VerkaufFormState> {
	const id = uuidSchema.safeParse(formData.get("id"));
	if (!id.success) return { message: "Verkauf fehlt." };

	const parsed = parseVerkaufForm(formData);
	if (!parsed.ok) return parsed.state;

	const { positionen, ...kopf } = parsed.data;

	let verkauf: Tables<"tb_verkauf">;
	try {
		verkauf = await updateVerkaufMitPositionen(id.data, kopf, positionen);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Verkauf konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/verkaeufe");
	return { success: true, verkauf, positionen };
}

/** Löscht einen Verkauf samt Positionen. */
async function deleteVerkaufAction(formData: FormData): Promise<void> {
	const id = uuidSchema.safeParse(formData.get("id"));
	if (!id.success) return;

	await deleteVerkaufMitPositionen(id.data);
	revalidatePath("/protected/verkaeufe");
}

export { createVerkaufAction, deleteVerkaufAction, updateVerkaufAction };
