import { createCrud } from "@/lib/data/crud";
import { standInsertSchema } from "@/lib/schemas/stand";

const TABLE = "tb_stand";

const crud = createCrud({
	table: TABLE,
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
	orderBy: { column: "bezeichnung" },
});

export const getStaende = crud.getAll;
export const getStand = crud.getById;
export const createStand = crud.create;
export const updateStand = crud.update;
export const deleteStand = crud.remove;
