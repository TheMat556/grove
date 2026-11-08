"use server";

import {
	createStandMitStandort,
	deleteStandMitStandort,
	updateStandMitStandort,
} from "@/lib/data/stand";
import {
	type StandMitStandortInput,
	standMitStandortSchema,
} from "@/lib/schemas/stand";
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
	insertSchema: standMitStandortSchema,
	mapInput: (formData) => ({
		bezeichnung: formData.get("bezeichnung"),
		// Rohe Strings; z.coerce im Schema parst die PLZ (leeres Feld -> Feldfehler).
		plz: formData.get("plz"),
		ort: formData.get("ort"),
		adresse: formData.get("adresse"),
	}),
	create: createStandMitStandort,
	// Adaptiert Partial<T> der Factory auf den vollständigen Input der Datenfunktion.
	update: (id, input) =>
		updateStandMitStandort(id, input as StandMitStandortInput),
	remove: deleteStandMitStandort,
	labels: { singular: "Stand" },
	revalidatePath: "/protected/staende",
	redirectOnUpdate: false,
});

export { createStandAction, deleteStandAction, updateStandAction };
