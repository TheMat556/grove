import { createCrud } from "@/lib/data/crud";
import { saisonCreateSchema, saisonInsertSchema } from "@/lib/schemas/saison";

const TABLE = "tb_saison";

const crud = createCrud({
	table: TABLE,
	insertSchema: saisonInsertSchema,
	createSchema: saisonCreateSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});

export const getSaisons = crud.getAll;
export const getSaison = crud.getById;
export const deleteSaison = crud.remove;

const OVERLAP_CONSTRAINT = "saison_zeitraum_ueberlappt_nicht";
const OVERLAP_MESSAGE =
	"Der Zeitraum überschneidet sich mit einer bestehenden Saison.";

/** Übersetzt den DB-Constraint-Fehler in eine Meldung für das Formular. */
export function toFriendlySaisonError(error: unknown): Error {
	if (error instanceof Error && error.message.includes(OVERLAP_CONSTRAINT)) {
		return new Error(OVERLAP_MESSAGE);
	}
	return error instanceof Error
		? error
		: new Error("Saison konnte nicht gespeichert werden.");
}

export async function createSaison(input: Parameters<typeof crud.create>[0]) {
	try {
		return await crud.create(input);
	} catch (error) {
		throw toFriendlySaisonError(error);
	}
}

export async function updateSaison(
	id: string,
	input: Parameters<typeof crud.update>[1],
) {
	try {
		return await crud.update(id, input);
	} catch (error) {
		throw toFriendlySaisonError(error);
	}
}
