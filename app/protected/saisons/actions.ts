"use server";

import { revalidatePath } from "next/cache";
import { createSaison } from "@/lib/data/saison";
import { saisonInsertSchema } from "@/lib/schemas/saison";

export type SaisonFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

/**
 * Server Action: validiert die Formulardaten gegen das Insert-Schema,
 * legt die Saison an und lädt die Seite neu. Feldfehler werden strukturiert
 * an das Formular zurückgegeben.
 */
export async function createSaisonAction(
	_prevState: SaisonFormState,
	formData: FormData,
): Promise<SaisonFormState> {
	const parsed = saisonInsertSchema.safeParse({
		name: formData.get("name"),
		start_datum: formData.get("start_datum"),
		end_datum: formData.get("end_datum"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	if (parsed.data.end_datum < parsed.data.start_datum) {
		return { errors: { end_datum: ["Enddatum darf nicht vor dem Startdatum liegen."] } };
	}

	try {
		await createSaison(parsed.data);
	} catch (e) {
		return { message: e instanceof Error ? e.message : "Saison konnte nicht angelegt werden." };
	}

	revalidatePath("/protected/saisons");
	return { success: true };
}
