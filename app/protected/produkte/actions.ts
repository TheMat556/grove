"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createProdukt,
	deleteProdukt,
	updateProdukt,
} from "@/lib/data/produkt";
import { produktCreateSchema } from "@/lib/schemas/produkt";

export type ProduktFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

/**
 * Server Action: validiert die Formulardaten gegen das Create-Schema
 * (inkl. feldübergreifender Regel bis_cm >= von_cm), legt das Produkt an
 * und lädt die Seite neu. Feldfehler werden strukturiert an das Formular
 * zurückgegeben.
 */

/** FormData-Wert in Zahl oder undefined (leer/fehlerhaft) umwandeln – nie 0 als Default. */
function zumNumber(wert: FormDataEntryValue | null): number | undefined {
	if (wert === null || wert === "") return undefined;
	const zahl = Number(wert);
	return Number.isNaN(zahl) ? undefined : zahl;
}

function produktFormValues(formData: FormData) {
	return {
		art: formData.get("art"),
		bezeichnung: formData.get("bezeichnung"),
		von_cm: zumNumber(formData.get("von_cm")),
		bis_cm: zumNumber(formData.get("bis_cm")),
	};
}

export async function createProduktAction(
	_prevState: ProduktFormState,
	formData: FormData,
): Promise<ProduktFormState> {
	const parsed = produktCreateSchema.safeParse(produktFormValues(formData));

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await createProdukt(parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Produkt konnte nicht angelegt werden.",
		};
	}

	revalidatePath("/protected/produkte");
	return { success: true };
}

/**
 * Server Action: validiert die Formulardaten gegen das Create-Schema
 * (das DB-CHECK-Constraint bis_cm >= von_cm gilt auch beim Aktualisieren,
 * nicht nur beim Anlegen), aktualisiert das Produkt und leitet zurück
 * zur Übersicht.
 */
export async function updateProduktAction(
	_prevState: ProduktFormState,
	formData: FormData,
): Promise<ProduktFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Produkt konnte nicht aktualisiert werden." };
	}

	const parsed = produktCreateSchema.safeParse(produktFormValues(formData));

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await updateProdukt(id, parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Produkt konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/produkte");
	redirect("/protected/produkte");
}

/**
 * Server Action: löscht das Produkt. Aufruf über ein einfaches Formular
 * in der Liste.
 */
export async function deleteProduktAction(formData: FormData) {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return;
	}

	// ponytail: FK-Fehler (Produkt wird von tb_position referenziert) landen als Nachricht auf der Liste
	try {
		await deleteProdukt(id);
	} catch (e) {
		const msg =
			e instanceof Error ? e.message : "Produkt konnte nicht gelöscht werden.";
		redirect(`/protected/produkte?error=${encodeURIComponent(msg)}`);
	}

	revalidatePath("/protected/produkte");
}
