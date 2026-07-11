import { createClient } from "@/lib/supabase/server";
import {
	type Wareneingang,
	type WareneingangInsert,
	wareneingangInsertSchema,
	wareneingangSchema,
} from "@/lib/schemas/wareneingang";

const TABLE = "tb_wareneingang";

export async function getWareneingaenge(): Promise<Wareneingang[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("datum", { ascending: false });

	if (error) {
		throw new Error(`Wareneingänge konnten nicht geladen werden: ${error.message}`);
	}

	return wareneingangSchema.array().parse(data);
}

export async function getWareneingaengeByStand(standId: string): Promise<Wareneingang[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("stand_id", standId)
		.order("datum", { ascending: false });

	if (error) {
		throw new Error(`Wareneingänge konnten nicht geladen werden: ${error.message}`);
	}

	return wareneingangSchema.array().parse(data);
}

export async function createWareneingang(input: WareneingangInsert): Promise<Wareneingang> {
	const werte = wareneingangInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Wareneingang konnte nicht angelegt werden: ${error.message}`);
	}

	return wareneingangSchema.parse(data);
}
