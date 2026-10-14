"use server";

import { createStand, deleteStand, updateStand } from "@/lib/data/stand";
import { standInsertSchema } from "@/lib/schemas/stand";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type StandFormState = EntityFormState;

const {
	createAction: createStandAction,
	updateAction: updateStandAction,
	deleteAction: deleteStandAction,
} = createEntityActions({
	insertSchema: standInsertSchema,
	mapInput: (formData) => ({
		standort_id: formData.get("standort_id"),
		bezeichnung: formData.get("bezeichnung"),
	}),
	create: createStand,
	update: updateStand,
	remove: deleteStand,
	labels: { singular: "Stand" },
	revalidatePath: "/protected/staende",
});

export { createStandAction, deleteStandAction, updateStandAction };
