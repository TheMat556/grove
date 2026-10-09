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

/**
 * Die CHECK-Regel bis_cm >= von_cm gilt auch beim Update – sonst landen
 * ungültige Bereiche als roher Postgres-Fehler in der Error-Boundary.
 */
const produktUpdateSchema = produktInsertSchema.refine(
	(werte) => werte.bis_cm >= werte.von_cm,
	{
		message: "bis_cm darf nicht kleiner als von_cm sein.",
		path: ["bis_cm"],
	},
);

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
		von_cm: Number(formData.get("von_cm")),
		bis_cm: Number(formData.get("bis_cm")),
	}),
	create: createProdukt,
	update: updateProdukt,
	remove: deleteProdukt,
	labels: { singular: "Produkt" },
	revalidatePath: "/protected/produkte",
});

export { createProduktAction, deleteProduktAction, updateProduktAction };
