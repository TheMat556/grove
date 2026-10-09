"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStand, deleteStand, updateStand } from "@/lib/data/stand";
import { standInsertSchema } from "@/lib/schemas/stand";

export type StandFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

/**
 * Server Action: validiert die Formulardaten gegen das Insert-Schema,
 * legt den Stand an und lädt die Seite neu. Feldfehler werden strukturiert
 * an das Formular zurückgegeben.
 */
export async function createStandAction(
	_prevState: StandFormState,
	formData: FormData,
): Promise<StandFormState> {
	const parsed = standInsertSchema.safeParse({
		standort_id: formData.get("standort_id"),
		bezeichnung: formData.get("bezeichnung"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await createStand(parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error ? e.message : "Stand konnte nicht angelegt werden.",
		};
	}

	revalidatePath("/protected/staende");
	return { success: true };
}

/**
 * Server Action: validiert die Formulardaten, aktualisiert den Stand
 * und leitet zurück zur Übersicht.
 */
export async function updateStandAction(
	_prevState: StandFormState,
	formData: FormData,
): Promise<StandFormState> {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { message: "Stand konnte nicht aktualisiert werden." };
	}

	const parsed = standInsertSchema.safeParse({
		standort_id: formData.get("standort_id"),
		bezeichnung: formData.get("bezeichnung"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await updateStand(id, parsed.data);
	} catch (e) {
		return {
			message:
				e instanceof Error
					? e.message
					: "Stand konnte nicht aktualisiert werden.",
		};
	}

	revalidatePath("/protected/staende");
	redirect("/protected/staende");
}

/**
 * Server Action: löscht den Stand. Aufruf über ein einfaches Formular
 * in der Liste.
 */
export async function deleteStandAction(formData: FormData) {
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return;
	}

	// ponytail: FK-Fehler beim Löschen landen vorerst in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
	await deleteStand(id);
	revalidatePath("/protected/staende");
}
