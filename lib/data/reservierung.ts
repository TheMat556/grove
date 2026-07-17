import { createCrud } from "@/lib/data/crud";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";

const TABLE = "tb_reservierung";

const crud = createCrud({
	table: TABLE,
	insertSchema: reservierungInsertSchema,
	labels: { singular: "Reservierung", plural: "Reservierungen" },
	orderBy: { column: "geplantes_datum" },
});

export const getReservierungen = crud.getAll;
export const getReservierung = crud.getById;
export const getReservierungenBySaisonId = crud.getBySaisonId;
export const createReservierung = crud.create;
export const updateReservierung = crud.update;
export const deleteReservierung = crud.remove;
