import "server-only";
import type { z } from "zod";
import { createCrud } from "@/lib/data/crud";
import { profilInsertSchema } from "@/lib/schemas/profil";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "tb_profil";
type Row = Database["public"]["Tables"][typeof TABLE]["Row"];

const crud = createCrud({
	table: TABLE,
	insertSchema: profilInsertSchema,
	labels: { singular: "Profil", plural: "Profile" },
	orderBy: { column: "name" },
});

export const getProfile = crud.getAll;
export const getProfil = crud.getById;
export const updateProfil = crud.update;
export const deleteProfil = crud.remove;

/**
 * Ein Profil anlegen. Anders als bei anderen Tabellen wird die ID nicht von der
 * DB per gen_random_uuid() vergeben, sondern muss explizit übergeben werden
 * (tb_profil.id == auth.users.id).
 */
export async function createProfil(
	id: string,
	input: z.infer<typeof profilInsertSchema>,
): Promise<Row> {
	const werte = profilInsertSchema.parse(input);
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ id, ...werte })
		.select()
		.single();
	if (error) {
		throw new Error(`Profil konnte nicht angelegt werden: ${error.message}`);
	}
	return data as Row;
}
