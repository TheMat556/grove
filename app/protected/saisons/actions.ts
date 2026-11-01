"use server";

import { createSaison, updateSaison } from "@/lib/data/saison";
import { istAktiv } from "@/lib/saison";
import { saisonCreateSchema, saisonInsertSchema } from "@/lib/schemas/saison";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type SaisonFormState = EntityFormState;

const { createAction: createSaisonAction, updateAction: updateSaisonAction } =
	createEntityActions({
		insertSchema: saisonInsertSchema,
		createSchema: saisonCreateSchema,
		updateSchema: saisonCreateSchema,
		mapInput: (formData) => {
			const start = formData.get("start_datum");
			const end = formData.get("end_datum");
			return {
				name: formData.get("name"),
				start_datum: start,
				end_datum: end,
				active:
					typeof start === "string" &&
					typeof end === "string" &&
					istAktiv(start, end),
			};
		},
		create: createSaison,
		update: updateSaison,
		labels: { singular: "Saison" },
		revalidatePath: "/protected/saisons",
	});

export { createSaisonAction, updateSaisonAction };
