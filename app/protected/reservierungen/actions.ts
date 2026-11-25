"use server";

import { revalidatePath } from "next/cache";
import {
	createReservierungMitProfil,
	deleteReservierung,
	updateReservierung,
} from "@/lib/data/reservierung";
import { updateVerkauf } from "@/lib/data/verkauf";
import { uuidSchema } from "@/lib/schemas/common";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ReservierungFormState = EntityFormState;

/** FormData → Eingabeobjekt für Anlegen und Bearbeiten. */
function reservierungInput(formData: FormData) {
	return {
		saison_id: formData.get("saison_id"),
		stand_id: formData.get("stand_id"),
		kunde_id: formData.get("kunde_id"),
		versandart: formData.get("versandart"),
		geplantes_datum: formData.get("geplantes_datum"),
		// Leeres Feld -> null (DB nullable), nicht 0.
		anzahlungsbetrag: formData.get("anzahlungsbetrag") || null,
		anmerkung: formData.get("anmerkung") || null,
		// Nur das Bearbeiten-Formular sendet einen Status; beim Anlegen gilt der
		// DB-Default 'offen' (undefined fällt durch das optionale Schema).
		status: formData.get("status") || undefined,
	};
}

/**
 * Legt eine Reservierung an. Optional mit verkauf_id: Dann wird sie direkt mit
 * dem Verkauf verknüpft (tb_verkauf.reservierung_id) – für das Anlegen aus dem
 * Verkaufsdialog heraus; ohne verkauf_id bleibt sie eigenständig.
 * ponytail: zwei Schreibvorgänge ohne DB-Transaktion – schlägt das Verknüpfen
 * fehl, bleibt eine unverknüpfte Reservierung stehen; RPC erst, wenn das real wird.
 */
async function createReservierungAction(
	_prevState: ReservierungFormState,
	formData: FormData,
): Promise<ReservierungFormState> {
	const verkaufId = uuidSchema.safeParse(formData.get("verkauf_id"));
	const parsed = reservierungInsertSchema.safeParse(
		reservierungInput(formData),
	);

	if (!parsed.success) {
		return {
			errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}

	try {
		const reservierung = await createReservierungMitProfil(parsed.data);
		if (verkaufId.success) {
			await updateVerkauf(verkaufId.data, {
				reservierung_id: reservierung.id,
			});
		}
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Reservierung konnte nicht angelegt werden.",
		};
	}

	revalidatePath("/protected/reservierungen");
	if (verkaufId.success) revalidatePath("/protected/verkaeufe");
	return { success: true };
}

const {
	updateAction: updateReservierungAction,
	deleteAction: deleteReservierungAction,
} = createEntityActions({
	insertSchema: reservierungInsertSchema,
	mapInput: reservierungInput,
	update: updateReservierung,
	remove: deleteReservierung,
	labels: { singular: "Reservierung" },
	revalidatePath: "/protected/reservierungen",
	// Löschen scheitert, wenn ein Verkauf auf die Reservierung verweist -> Banner.
	removeErrorPath: "/protected/reservierungen",
});

export {
	createReservierungAction,
	deleteReservierungAction,
	updateReservierungAction,
};
