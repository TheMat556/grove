import { createClient } from "@/lib/supabase/server";
import { type Verkauf, type VerkaufInsert, verkaufInsertSchema, verkaufSchema } from "@/lib/schemas/verkauf";

const TABLE = "tb_verkauf";

export async function getVerkaeufe(): Promise<Verkauf[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("verkauft_am", { ascending: false });

	if (error) {
		throw new Error(`Verkäufe konnten nicht geladen werden: ${error.message}`);
	}

	return verkaufSchema.array().parse(data);
}

export async function getVerkaeufeByStand(standId: string): Promise<Verkauf[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("stand_id", standId)
		.order("verkauft_am", { ascending: false });

	if (error) {
		throw new Error(`Verkäufe konnten nicht geladen werden: ${error.message}`);
	}

	return verkaufSchema.array().parse(data);
}

/**
 * reservierung_id ist im Insert-Schema ausgeklammert (optional): bei einem
 * Sofortkauf bleibt sie NULL, beim Abschluss einer Reservierung wird sie
 * separat übergeben.
 */
export async function createVerkauf(input: VerkaufInsert, reservierungId?: string): Promise<Verkauf> {
	const werte = verkaufInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ ...werte, reservierung_id: reservierungId ?? null })
		.select()
		.single();

	if (error) {
		throw new Error(`Verkauf konnte nicht angelegt werden: ${error.message}`);
	}

	return verkaufSchema.parse(data);
}
