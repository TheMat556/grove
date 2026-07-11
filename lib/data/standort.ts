import { createClient } from "@/lib/supabase/server";
import {
	type Standort,
	type StandortInsert,
	standortInsertSchema,
	standortSchema,
} from "@/lib/schemas/standort";

const TABLE = "tb_standort";

export async function getStandorte(): Promise<Standort[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("ort", { ascending: true });

	if (error) {
		throw new Error(`Standorte konnten nicht geladen werden: ${error.message}`);
	}

	return standortSchema.array().parse(data);
}

export async function createStandort(input: StandortInsert): Promise<Standort> {
	const werte = standortInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Standort konnte nicht angelegt werden: ${error.message}`);
	}

	return standortSchema.parse(data);
}
