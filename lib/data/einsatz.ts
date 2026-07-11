import { createClient } from "@/lib/supabase/server";
import { type Einsatz, type EinsatzInsert, einsatzInsertSchema, einsatzSchema } from "@/lib/schemas/einsatz";

const TABLE = "tb_einsatz";

export async function getEinsaetze(): Promise<Einsatz[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("von", { ascending: false });

	if (error) {
		throw new Error(`Einsätze konnten nicht geladen werden: ${error.message}`);
	}

	return einsatzSchema.array().parse(data);
}

export async function getEinsaetzeByStand(standId: string): Promise<Einsatz[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("stand_id", standId)
		.order("von", { ascending: false });

	if (error) {
		throw new Error(`Einsätze konnten nicht geladen werden: ${error.message}`);
	}

	return einsatzSchema.array().parse(data);
}

export async function createEinsatz(input: EinsatzInsert): Promise<Einsatz> {
	const werte = einsatzInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Einsatz konnte nicht angelegt werden: ${error.message}`);
	}

	return einsatzSchema.parse(data);
}
