"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createKunde } from "@/lib/data/kunde";
import {
	createReservierungMitProfil,
	createReservierungMitVerkauf,
	deleteReservierung,
	updateReservierung,
} from "@/lib/data/reservierung";
import { getCurrentProfilId } from "@/lib/data/session";
import { uuidSchema } from "@/lib/schemas/common";
import { kundeInsertSchema } from "@/lib/schemas/kunde";
import {
	reservierungCreateSchema,
	reservierungInsertSchema,
} from "@/lib/schemas/reservierung";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ReservierungFormState = EntityFormState & {
	/** Inline angelegter Kunde, falls die Reservierung danach scheitert. */
	kunde?: { id: string; name: string };
};

/** Platzhalter-Kunde, damit die Reservierung parallel zum neuen Kunden validiert wird. */
const NEUER_KUNDE_PLATZHALTER = "00000000-0000-4000-8000-000000000000";

/**
 * FormData → Eingabeobjekt für Anlegen und Bearbeiten. `kundeId` überschreibt
 * das Formularfeld (Inline angelegter Kunde beim Reservierungs-Submit).
 */
function reservierungInput(formData: FormData, kundeId?: string) {
	return {
		saison_id: formData.get("saison_id"),
		stand_id: formData.get("stand_id"),
		kunde_id: kundeId ?? formData.get("kunde_id"),
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
 * Legt eine Reservierung an. Optional mit verkauf_id: Dann wird sie in derselben
 * DB-Transaktion mit dem Verkauf verknüpft (tb_verkauf.reservierung_id) – für das
 * Anlegen aus dem Verkaufsdialog heraus; ohne verkauf_id bleibt sie eigenständig.
 * Ein bereits verknüpfter Verkauf wird nicht überschrieben, sondern gemeldet.
 */
async function createReservierungAction(
	_prevState: ReservierungFormState,
	formData: FormData,
): Promise<ReservierungFormState> {
	const verkaufId = uuidSchema.safeParse(formData.get("verkauf_id"));
	// Inline-Panel „Neuer Kunde": ein Klick auf „Reservierung anlegen" legt den
	// Kunden mit an, statt erst „Kunde anlegen" zu verlangen.
	const neuerKunde = formData.get("neuer_kunde") === "1";

	const kundeParsed = neuerKunde
		? kundeInsertSchema.safeParse({
				name: formData.get("name"),
				telefon: formData.get("telefon"),
				plz: formData.get("plz"),
				adresse: formData.get("adresse"),
				ist_firma: formData.get("ist_firma") === "on",
			})
		: null;

	const parsed = reservierungCreateSchema.safeParse(
		reservierungInput(
			formData,
			neuerKunde ? NEUER_KUNDE_PLATZHALTER : undefined,
		),
	);

	const kundeFehler =
		kundeParsed && !kundeParsed.success
			? (kundeParsed.error.flatten().fieldErrors as Record<string, string[]>)
			: undefined;
	const reservierungFehler = !parsed.success
		? (parsed.error.flatten().fieldErrors as Record<string, string[]>)
		: undefined;

	// Beide Formulare zusammen melden, damit ein Klick alle Fehler zeigt.
	if (!parsed.success || kundeFehler) {
		return { errors: { ...reservierungFehler, ...kundeFehler } };
	}

	let neuerKundeDatensatz: { id: string; name: string } | undefined;
	if (kundeParsed?.success) {
		try {
			neuerKundeDatensatz = await createKunde(kundeParsed.data);
		} catch (e) {
			return {
				message:
					e instanceof Error
						? e.message
						: "Kunde konnte nicht angelegt werden.",
			};
		}
	}

	const daten = neuerKundeDatensatz
		? { ...parsed.data, kunde_id: neuerKundeDatensatz.id }
		: parsed.data;

	try {
		if (verkaufId.success) {
			await createReservierungMitVerkauf(daten, verkaufId.data);
		} else {
			await createReservierungMitProfil(daten);
		}
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Reservierung konnte nicht angelegt werden.",
			// Kunde ist bereits angelegt: Auswahl im Formular nachziehen, damit ein
			// zweiter Klick keinen doppelten Kunden erzeugt.
			kunde: neuerKundeDatensatz,
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

/** Status, den die Listen-Buttons setzen dürfen (Storno läuft über den Dialog). */
const listenStatusSchema = z.enum(["offen", "erfuellt"]);

/**
 * Setzt den Status einer Reservierung aus einer Liste heraus: Erledigt-Button im
 * Dashboard, Status-Toggle in Reservierungen und Verkäufe. Der Zielstatus kommt
 * aus dem serverseitig gerenderten Formular, nicht aus Client-State.
 */
async function setzeReservierungStatusAction(
	formData: FormData,
): Promise<void> {
	const id = uuidSchema.safeParse(formData.get("id"));
	const status = listenStatusSchema.safeParse(formData.get("status"));
	if (!id.success || !status.success) return;

	await getCurrentProfilId();
	await updateReservierung(id.data, { status: status.data });

	revalidatePath("/protected");
	revalidatePath("/protected/reservierungen");
	revalidatePath("/protected/verkaeufe");
}

export {
	createReservierungAction,
	deleteReservierungAction,
	setzeReservierungStatusAction,
	updateReservierungAction,
};
