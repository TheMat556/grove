import { createClient } from "@/lib/supabase/server";
import {
	type Preisempfehlung,
	type PreisempfehlungInsert,
	preisempfehlungInsertSchema,
	preisempfehlungSchema,
} from "@/lib/schemas/preisempfehlung";

const TABLE = "tb_preisempfehlung";

export async function getPreisempfehlungen(): Promise<Preisempfehlung[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*");

	if (error) {
		throw new Error(`Preisempfehlungen konnten nicht geladen werden: ${error.message}`);
	}

	return preisempfehlungSchema.array().parse(data);
}

/**
 * saison_id und produkt_id sind im Insert-Schema ausgeklammert und werden
 * daher als eigene Argumente übergeben (z. B. aus je einem Picker). Beide
 * Spalten sind in der DB NOT NULL.
 */
export async function createPreisempfehlung(
	saisonId: string,
	produktId: string,
	input: PreisempfehlungInsert,
): Promise<Preisempfehlung> {
	const werte = preisempfehlungInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ ...werte, saison_id: saisonId, produkt_id: produktId })
		.select()
		.single();

	if (error) {
		throw new Error(`Preisempfehlung konnte nicht angelegt werden: ${error.message}`);
	}

	return preisempfehlungSchema.parse(data);
}
