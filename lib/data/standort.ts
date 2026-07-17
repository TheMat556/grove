import { createCrud } from "@/lib/data/crud";
import { standortInsertSchema } from "@/lib/schemas/standort";

const TABLE = "tb_standort";

const crud = createCrud({
	table: TABLE,
	insertSchema: standortInsertSchema,
	labels: { singular: "Standort", plural: "Standorte" },
	orderBy: { column: "ort" },
});

export const getStandorte = crud.getAll;
export const getStandort = crud.getById;
export const createStandort = crud.create;
export const updateStandort = crud.update;
export const deleteStandort = crud.remove;
