import { createCrud } from "@/lib/data/crud";
import { saisonCreateSchema, saisonInsertSchema } from "@/lib/schemas/saison";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

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

export async function setSaisonActive(
	id: string,
): Promise<Tables<"tb_saison">> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({ active: true })
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw new Error(`Saison konnte nicht aktiviert werden: ${error.message}`);
	}

	return data;
}
