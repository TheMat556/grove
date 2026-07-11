import { createClient } from "@/lib/supabase/server";
import { type Saison, type SaisonInsert, saisonInsertSchema, saisonSchema } from "@/lib/schemas/saison";

const TABLE = "tb_saison";

export async function getSaisons(): Promise<Saison[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.order("start_datum", { ascending: false });

	if (error) {
		throw new Error(`Saisons konnten nicht geladen werden: ${error.message}`);
	}

	return saisonSchema.array().parse(data);
}

export async function createSaison(input: SaisonInsert): Promise<Saison> {
	const werte = saisonInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(werte)
		.select()
		.single();

	if (error) {
		throw new Error(`Saison konnte nicht angelegt werden: ${error.message}`);
	}

	return saisonSchema.parse(data);
}
