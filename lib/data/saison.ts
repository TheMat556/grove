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
export const createSaison = crud.create;
export const updateSaison = crud.update;
export const deleteSaison = crud.remove;

