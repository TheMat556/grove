import { createCrud } from "@/lib/data/crud";
import { kundeInsertSchema } from "@/lib/schemas/kunde";

const TABLE = "tb_kunde";

const crud = createCrud({
	table: TABLE,
	insertSchema: kundeInsertSchema,
	labels: { singular: "Kunde", plural: "Kunden" },
	orderBy: { column: "name" },
});

export const getKunden = crud.getAll;
export const getKunde = crud.getById;
export const createKunde = crud.create;
export const updateKunde = crud.update;
export const deleteKunde = crud.remove;
