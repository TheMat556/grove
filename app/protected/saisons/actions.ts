"use server";

import { createSaison, updateSaison } from "@/lib/data/saison";
import {
	saisonCreateSchema,
	saisonInsertSchema,
	saisonUpdateSchema,
} from "@/lib/schemas/saison";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type SaisonFormState = EntityFormState;

const { createAction: createSaisonAction, updateAction: updateSaisonAction } =
	createEntityActions({
		insertSchema: saisonInsertSchema,
		createSchema: saisonCreateSchema,
		updateSchema: saisonUpdateSchema,
		mapInput: (formData) => ({
			name: formData.get("name"),
			start_datum: formData.get("start_datum"),
			end_datum: formData.get("end_datum"),
		}),
		create: createSaison,
		update: updateSaison,
		labels: { singular: "Saison" },
		revalidatePath: "/protected/saisons",
		redirectOnUpdate: false,
	});

export { createSaisonAction, updateSaisonAction };
