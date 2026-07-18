import { createCrud } from "@/lib/data/crud";
import { preisempfehlungInsertSchema } from "@/lib/schemas/preisempfehlung";

const TABLE = "tb_preisempfehlung";

const crud = createCrud({
	table: TABLE,
	insertSchema: preisempfehlungInsertSchema,
	labels: { singular: "Preisempfehlung", plural: "Preisempfehlungen" },
	orderBy: { column: "preis" },
});

export const getPreisempfehlungen = crud.getAll;
export const getPreisempfehlung = crud.getById;
export const getPreisempfehlungenBySaisonId = crud.getBySaisonId;
export const createPreisempfehlung = crud.create;
export const updatePreisempfehlung = crud.update;
export const deletePreisempfehlung = crud.remove;
