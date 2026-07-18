import { createCrud } from "@/lib/data/crud";
import {
	produktCreateSchema,
	produktInsertSchema,
} from "@/lib/schemas/produkt";

const TABLE = "tb_produkt";

const crud = createCrud({
	table: TABLE,
	insertSchema: produktInsertSchema,
	createSchema: produktCreateSchema,
	labels: { singular: "Produkt", plural: "Produkte" },
	orderBy: { column: "bezeichnung" },
});

export const getProdukte = crud.getAll;
export const getProdukt = crud.getById;
export const createProdukt = crud.create;
export const updateProdukt = crud.update;
export const deleteProdukt = crud.remove;
