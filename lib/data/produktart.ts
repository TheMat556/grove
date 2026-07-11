import { createClient } from "@/lib/supabase/server";
import {
	type Produktart,
	type ProduktartInsert,
	produktartInsertSchema,
	produktartSchema,
} from "@/lib/schemas/produktart";

const TABLE = "tb_produktart";

export async function getProduktarten(): Promise<Produktart[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("produktart", { ascending: true });

	if (error) {
		throw new Error(`Produktarten konnten nicht geladen werden: ${error.message}`);
	}

	return produktartSchema.array().parse(data);
}

export async function createProduktart(input: ProduktartInsert): Promise<Produktart> {
	const werte = produktartInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Produktart konnte nicht angelegt werden: ${error.message}`);
	}

	return produktartSchema.parse(data);
}
