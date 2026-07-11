import { createClient } from "@/lib/supabase/server";
import { type Produkt, type ProduktInsert, produktInsertSchema, produktSchema } from "@/lib/schemas/produkt";

const TABLE = "tb_produkt";

export async function getProdukte(): Promise<Produkt[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("bezeichnung", { ascending: true });

	if (error) {
		throw new Error(`Produkte konnten nicht geladen werden: ${error.message}`);
	}

	return produktSchema.array().parse(data);
}

export async function createProdukt(input: ProduktInsert): Promise<Produkt> {
	const werte = produktInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Produkt konnte nicht angelegt werden: ${error.message}`);
	}

	return produktSchema.parse(data);
}
