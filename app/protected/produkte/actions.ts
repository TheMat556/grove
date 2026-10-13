"use server";

import {
	createProdukt,
	deleteProdukt,
	updateProdukt,
} from "@/lib/data/produkt";
import {
	produktCreateSchema,
	produktInsertSchema,
	produktUpdateSchema,
} from "@/lib/schemas/produkt";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type ProduktFormState = EntityFormState;

const {
	createAction: createProduktAction,
	updateAction: updateProduktAction,
	deleteAction: deleteProduktAction,
} = createEntityActions({
	insertSchema: produktInsertSchema,
	createSchema: produktCreateSchema,
	updateSchema: produktUpdateSchema,
	mapInput: (formData) => ({
		art: formData.get("art"),
		bezeichnung: formData.get("bezeichnung"),
		// Rohe Strings; z.coerce im Schema parst (leeres Feld -> Feldfehler).
		von_cm: formData.get("von_cm"),
		bis_cm: formData.get("bis_cm"),
	}),
	create: createProdukt,
	update: updateProdukt,
	remove: deleteProdukt,
	labels: { singular: "Produkt" },
	revalidatePath: "/protected/produkte",
});

export { createProduktAction, deleteProduktAction, updateProduktAction };
