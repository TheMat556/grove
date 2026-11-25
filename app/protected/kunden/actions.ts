"use server";

import { createKunde, deleteKunde, updateKunde } from "@/lib/data/kunde";
import { kundeInsertSchema } from "@/lib/schemas/kunde";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type KundeFormState = EntityFormState & {
	/** Der angelegte Kunde, damit Inline-Dialoge ihn direkt auswählen können. */
	kunde?: { id: string; name: string };
};

/** FormData → Eingabeobjekt für Anlegen und Bearbeiten. */
function kundeInput(formData: FormData) {
	return {
		name: formData.get("name"),
		telefon: formData.get("telefon"),
		plz: formData.get("plz"),
		adresse: formData.get("adresse"),
		ist_firma: formData.get("ist_firma") === "on",
	};
}

const {
	createAction: createKundeAction,
	updateAction: updateKundeAction,
	deleteAction: deleteKundeAction,
} = createEntityActions({
	insertSchema: kundeInsertSchema,
	mapInput: kundeInput,
	create: createKunde,
	// Den angelegten Kunden im Erfolgs-Zustand melden – für die Inline-Anlage
	// aus einem Reservierungsformular (Auswahl übernehmen statt Seite wechseln).
	createSuccess: (row) => ({ kunde: row as KundeFormState["kunde"] }),
	update: updateKunde,
	remove: deleteKunde,
	labels: { singular: "Kunde" },
	revalidatePath: "/protected/kunden",
});

export { createKundeAction, deleteKundeAction, updateKundeAction };
