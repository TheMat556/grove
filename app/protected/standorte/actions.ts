"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createStandort,
	deleteStandort,
	updateStandort,
} from "@/lib/data/standort";
import { standortInsertSchema } from "@/lib/schemas/standort";

export type StandortFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

/**
 * Server Action: validiert die Formulardaten gegen das Insert-Schema,
 * legt den Standort an und lädt die Seite neu. Feldfehler werden strukturiert
 * an das Formular zurückgegeben.
 */
export async function createStandortAction(
	_prevState: StandortFormState,
	formData: FormData,
): Promise<StandortFormState> {
	const parsed = standortInsertSchema.safeParse({
		plz: Number(formData.get("plz")),
		ort: formData.get("ort"),
		adresse: formData.get("adresse"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await createStandort(parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Standort konnte nicht angelegt werden.",
		};
	}

	revalidatePath("/protected/standorte");
	return { success: true };
}

/**
 * Server Action: validiert die Formulardaten, aktualisiert den Standort
 * und leitet zurück zur Übersicht.
 */
export async function updateStandortAction(
	_prevState: StandortFormState,
	formData: FormData,
): Promise<StandortFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Standort konnte nicht aktualisiert werden." };
	}

	const parsed = standortInsertSchema.safeParse({
		plz: Number(formData.get("plz")),
		ort: formData.get("ort"),
		adresse: formData.get("adresse"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await updateStandort(id, parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Standort konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/standorte");
	redirect("/protected/standorte");
}

/**
 * Server Action: löscht den Standort. Aufruf über ein einfaches Formular
 * in der Liste.
 */
export async function deleteStandortAction(formData: FormData) {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return;
	}

	// ponytail: FK-Fehler beim Löschen landen vorerst in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
	await deleteStandort(id);
	revalidatePath("/protected/standorte");
}
