import { createClient } from "@/lib/supabase/server";
import { type Kunde, type KundeInsert, kundeInsertSchema, kundeSchema } from "@/lib/schemas/kunde";

const TABLE = "tb_kunde";

export async function getKunden(): Promise<Kunde[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("name", { ascending: true });

	if (error) {
		throw new Error(`Kunden konnten nicht geladen werden: ${error.message}`);
	}

	return kundeSchema.array().parse(data);
}

export async function createKunde(input: KundeInsert): Promise<Kunde> {
	const werte = kundeInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Kunde konnte nicht angelegt werden: ${error.message}`);
	}

	return kundeSchema.parse(data);
}
