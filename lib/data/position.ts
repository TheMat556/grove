import { createClient } from "@/lib/supabase/server";
import { type Position, type PositionInsert, positionInsertSchema, positionSchema } from "@/lib/schemas/position";

const TABLE = "tb_position";

export async function getPositionenByVerkauf(verkaufId: string): Promise<Position[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").eq("verkauf_id", verkaufId);

	if (error) {
		throw new Error(`Positionen konnten nicht geladen werden: ${error.message}`);
	}

	return positionSchema.array().parse(data);
}

/**
 * Positionen werden als Batch unter einem Verkauf angelegt. Jede Zeile wird
 * einzeln validiert, bevor der gemeinsame Insert erfolgt.
 */
export async function createPositionen(positionen: PositionInsert[]): Promise<Position[]> {
	const werte = positionen.map((p) => positionInsertSchema.parse(p));

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select();

	if (error) {
		throw new Error(`Positionen konnten nicht angelegt werden: ${error.message}`);
	}

	return positionSchema.array().parse(data);
}
