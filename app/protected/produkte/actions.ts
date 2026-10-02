"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createProdukt,
	deleteProdukt,
	updateProdukt,
} from "@/lib/data/produkt";
import {
	produktCreateSchema,
	produktInsertSchema,
} from "@/lib/schemas/produkt";

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
export async function createProduktAction(
	_prevState: ProduktFormState,
	formData: FormData,
): Promise<ProduktFormState> {
	const parsed = produktCreateSchema.safeParse({
		art: formData.get("art"),
		bezeichnung: formData.get("bezeichnung"),
		von_cm: Number(formData.get("von_cm")),
		bis_cm: Number(formData.get("bis_cm")),
	});

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
 * Server Action: validiert die Formulardaten gegen das Insert-Schema
 * (ohne feldübergreifende Regel, spiegelt das DB-CHECK-Verhalten beim
 * Anlegen), aktualisiert das Produkt und leitet zurück zur Übersicht.
 */
export async function updateProduktAction(
	_prevState: ProduktFormState,
	formData: FormData,
): Promise<ProduktFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Produkt konnte nicht aktualisiert werden." };
	}

	const parsed = produktInsertSchema.safeParse({
		art: formData.get("art"),
		bezeichnung: formData.get("bezeichnung"),
		von_cm: Number(formData.get("von_cm")),
		bis_cm: Number(formData.get("bis_cm")),
	});

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

	// ponytail: FK-Fehler beim Löschen landen vorerst in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
	await deleteProdukt(id);
	revalidatePath("/protected/produkte");
}
