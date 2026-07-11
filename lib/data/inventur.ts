import { createClient } from "@/lib/supabase/server";
import { type Inventur, type InventurInsert, inventurInsertSchema, inventurSchema } from "@/lib/schemas/inventur";

const TABLE = "tb_inventur";

export async function getInventuren(): Promise<Inventur[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("datum", { ascending: false });

	if (error) {
		throw new Error(`Inventuren konnten nicht geladen werden: ${error.message}`);
	}

	return inventurSchema.array().parse(data);
}

export async function getInventurenByStand(standId: string): Promise<Inventur[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("stand_id", standId)
		.order("datum", { ascending: false });

	if (error) {
		throw new Error(`Inventuren konnten nicht geladen werden: ${error.message}`);
	}

	return inventurSchema.array().parse(data);
}

export async function createInventur(input: InventurInsert): Promise<Inventur> {
	const werte = inventurInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Inventur konnte nicht angelegt werden: ${error.message}`);
	}

	return inventurSchema.parse(data);
}
