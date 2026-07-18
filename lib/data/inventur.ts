import { createCrud } from "@/lib/data/crud";
import { inventurInsertSchema } from "@/lib/schemas/inventur";

const TABLE = "tb_inventur";

const crud = createCrud({
	table: TABLE,
	insertSchema: inventurInsertSchema,
	labels: { singular: "Inventur", plural: "Inventuren" },
	orderBy: { column: "datum" },
});

export const getInventuren = crud.getAll;
export const getInventur = crud.getById;
export const getInventurenBySaisonId = crud.getBySaisonId;
export const createInventur = crud.create;
export const updateInventur = crud.update;
export const deleteInventur = crud.remove;
