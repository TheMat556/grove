"use server";

import {
	createPreisempfehlung,
	deletePreisempfehlung,
	updatePreisempfehlung,
} from "@/lib/data/preisempfehlung";
import { preisempfehlungInsertSchema } from "@/lib/schemas/preisempfehlung";
import {
	createEntityActions,
	type EntityFormState,
} from "../_crud/entity-actions";

export type PreisempfehlungFormState = EntityFormState;

const {
	createAction: createPreisempfehlungAction,
	updateAction: updatePreisempfehlungAction,
	deleteAction: deletePreisempfehlungAction,
} = createEntityActions({
	insertSchema: preisempfehlungInsertSchema,
	mapInput: (formData) => ({
		saison_id: formData.get("saison_id"),
		produkt_id: formData.get("produkt_id"),
		// Roher String; z.coerce im Schema parst (leeres Feld -> Feldfehler).
		preis: formData.get("preis"),
	}),
	create: createPreisempfehlung,
	update: updatePreisempfehlung,
	remove: deletePreisempfehlung,
	labels: { singular: "Preisempfehlung" },
	revalidatePath: "/protected/preisempfehlungen",
});

export {
	createPreisempfehlungAction,
	deletePreisempfehlungAction,
	updatePreisempfehlungAction,
};
