"use server";

import { createKunde, deleteKunde, updateKunde } from "@/lib/data/kunde";
import { kundeInsertSchema } from "@/lib/schemas/kunde";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type KundeFormState = EntityFormState;

const {
	createAction: createKundeAction,
	updateAction: updateKundeAction,
	deleteAction: deleteKundeAction,
} = createEntityActions({
	insertSchema: kundeInsertSchema,
	mapInput: (formData) => ({
		name: formData.get("name"),
		telefon: formData.get("telefon"),
		adresse: formData.get("adresse"),
		ist_firma: formData.get("ist_firma") === "on",
	}),
	create: createKunde,
	update: updateKunde,
	remove: deleteKunde,
	labels: { singular: "Kunde" },
	revalidatePath: "/protected/kunden",
});

export { createKundeAction, deleteKundeAction, updateKundeAction };
