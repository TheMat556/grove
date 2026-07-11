import { createClient } from "@/lib/supabase/server";
import {
	type Wareneingangsposition,
	type WareneingangspositionInsert,
	wareneingangspositionInsertSchema,
	wareneingangpositionSchema,
} from "@/lib/schemas/wareneingangsposition";

const TABLE = "tb_wareneingangsposition";

export async function getPositionenByWareneingang(wareneingangId: string): Promise<Wareneingangsposition[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").eq("wareneingang_id", wareneingangId);

	if (error) {
		throw new Error(`Wareneingangspositionen konnten nicht geladen werden: ${error.message}`);
	}

	return wareneingangpositionSchema.array().parse(data);
}

/**
 * Positionen werden als Batch unter einem Wareneingang angelegt. Jede Zeile
 * wird einzeln validiert, bevor der gemeinsame Insert erfolgt.
 */
export async function createWareneingangspositionen(
	positionen: WareneingangspositionInsert[],
): Promise<Wareneingangsposition[]> {
	const werte = positionen.map((p) => wareneingangspositionInsertSchema.parse(p));

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select();

	if (error) {
		throw new Error(`Wareneingangspositionen konnten nicht angelegt werden: ${error.message}`);
	}

	return wareneingangpositionSchema.array().parse(data);
}
