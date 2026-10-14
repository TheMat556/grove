"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createKunde, deleteKunde, updateKunde } from "@/lib/data/kunde";
import { kundeInsertSchema } from "@/lib/schemas/kunde";

export type KundeFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

/**
 * Server Action: validiert die Formulardaten gegen das Insert-Schema,
 * legt den Kunden an und lädt die Seite neu. Feldfehler werden strukturiert
 * an das Formular zurückgegeben.
 */
export async function createKundeAction(
	_prevState: KundeFormState,
	formData: FormData,
): Promise<KundeFormState> {
	const parsed = kundeInsertSchema.safeParse({
		name: formData.get("name"),
		telefon: formData.get("telefon"),
		adresse: formData.get("adresse"),
		ist_firma: formData.get("ist_firma") === "on",
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await createKunde(parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error ? e.message : "Kunde konnte nicht angelegt werden.",
		};
	}

	revalidatePath("/protected/kunden");
	return { success: true };
}

/**
 * Server Action: validiert die Formulardaten, aktualisiert den Kunden
 * und leitet zurück zur Übersicht.
 */
export async function updateKundeAction(
	_prevState: KundeFormState,
	formData: FormData,
): Promise<KundeFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Kunde konnte nicht aktualisiert werden." };
	}

	const parsed = kundeInsertSchema.safeParse({
		name: formData.get("name"),
		telefon: formData.get("telefon"),
		adresse: formData.get("adresse"),
		ist_firma: formData.get("ist_firma") === "on",
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await updateKunde(id, parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Kunde konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/kunden");
	redirect("/protected/kunden");
}

/**
 * Server Action: löscht den Kunden. Aufruf über ein einfaches Formular
 * in der Liste.
 */
export async function deleteKundeAction(formData: FormData) {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return;
	}

	// ponytail: FK-Fehler beim Löschen landen vorerst in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
	await deleteKunde(id);
	revalidatePath("/protected/kunden");
}
