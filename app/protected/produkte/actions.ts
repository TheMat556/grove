"use server";

import {
	createProdukt,
	deleteProdukt,
	updateProdukt,
} from "@/lib/data/produkt";
import {
	produktCreateSchema,
	produktInsertSchema,
} from "@/lib/schemas/produkt";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ProduktFormState = EntityFormState;

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

/**
 * Der DB-CHECK bis_cm >= von_cm gilt beim Anlegen UND beim Aktualisieren –
 * volle Formularwerte werden in beiden Fällen ohnehin gesendet.
 */
const {
	createAction: createProduktAction,
	updateAction: updateProduktAction,
	deleteAction: deleteProduktAction,
} = createEntityActions({
	insertSchema: produktInsertSchema,
	createSchema: produktCreateSchema,
	updateSchema: produktCreateSchema,
	mapInput: produktFormValues,
	create: createProdukt,
	update: updateProdukt,
	remove: deleteProdukt,
	labels: { singular: "Produkt" },
	revalidatePath: "/protected/produkte",
	removeErrorPath: "/protected/produkte",
});

export { createProduktAction, deleteProduktAction, updateProduktAction };
