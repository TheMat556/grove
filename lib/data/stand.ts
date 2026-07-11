import { createClient } from "@/lib/supabase/server";
import { type Stand, type StandInsert, standInsertSchema, standSchema } from "@/lib/schemas/stand";

const TABLE = "tb_stand";

export async function getStaende(): Promise<Stand[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("bezeichnung", { ascending: true });

	if (error) {
		throw new Error(`Stände konnten nicht geladen werden: ${error.message}`);
	}

	return standSchema.array().parse(data);
}

/**
 * standort_id ist im Insert-Schema ausgeklammert und wird daher als eigenes
 * Argument übergeben (z. B. aus einem Standort-Picker). Der DB-Insert braucht
 * die Spalte trotzdem, da sie NOT NULL ist.
 */
export async function createStand(standortId: string, input: StandInsert): Promise<Stand> {
	const werte = standInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ ...werte, standort_id: standortId })
		.select()
		.single();

	if (error) {
		throw new Error(`Stand konnte nicht angelegt werden: ${error.message}`);
	}

	return standSchema.parse(data);
}
