import { createCrud } from "@/lib/data/crud";
import {
	einsatzCreateSchema,
	einsatzInsertSchema,
} from "@/lib/schemas/einsatz";

const TABLE = "tb_einsatz";

const crud = createCrud({
	table: TABLE,
	insertSchema: einsatzInsertSchema,
	createSchema: einsatzCreateSchema,
	labels: { singular: "Einsatz", plural: "Einsätze" },
	orderBy: { column: "von" },
});

export const getEinsaetze = crud.getAll;
export const getEinsatz = crud.getById;
export const getEinsaetzeBySaisonId = crud.getBySaisonId;
export const createEinsatz = crud.create;
export const updateEinsatz = crud.update;
export const deleteEinsatz = crud.remove;
