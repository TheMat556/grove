"use server";

import {
	createStandort,
	deleteStandort,
	updateStandort,
} from "@/lib/data/standort";
import { standortInsertSchema } from "@/lib/schemas/standort";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type StandortFormState = EntityFormState;

const {
	createAction: createStandortAction,
	updateAction: updateStandortAction,
	deleteAction: deleteStandortAction,
} = createEntityActions({
	insertSchema: standortInsertSchema,
	mapInput: (formData) => ({
		plz: Number(formData.get("plz")),
		ort: formData.get("ort"),
		adresse: formData.get("adresse"),
	}),
	create: createStandort,
	update: updateStandort,
	remove: deleteStandort,
	labels: { singular: "Standort" },
	revalidatePath: "/protected/standorte",
});

export { createStandortAction, deleteStandortAction, updateStandortAction };
