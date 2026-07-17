import "server-only";
import { cache } from "react";
import { standSaisonInsertSchema } from "@/lib/schemas/stand-saison";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "tb_stand_saison";
const COLUMNS = "stand_id, saison_id";

/**
 * Verknüpft einen Stand mit einer Saison (CREATE in der Junction-Tabelle).
 */
export async function assignStandToSaison(
	standId: string,
	saisonId: string,
): Promise<Tables<typeof TABLE>> {
	const werte = standSaisonInsertSchema.parse({
		stand_id: standId,
		saison_id: saisonId,
	});

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(werte)
		.select(COLUMNS)
		.single();

	if (error) {
		throw new Error(
			`Stand konnte nicht mit Saison verknüpft werden: ${error.message}`,
		);
	}

	return data;
}

/**
 * Entfernt die Verknüpfung eines Standes mit einer Saison (DELETE aus der
 * Junction-Tabelle).
 */
export async function removeStandFromSaison(
	standId: string,
	saisonId: string,
): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq("stand_id", standId)
		.eq("saison_id", saisonId);

	if (error) {
		throw new Error(
			`Verknüpfung konnte nicht gelöscht werden: ${error.message}`,
		);
	}
}

/**
 * Gibt alle Stände zurück, die mit der angegebenen Saison verknüpft sind.
 */
export const getStaendeBySaison = cache(
	async (saisonId: string): Promise<Tables<typeof TABLE>[]> => {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from(TABLE)
			.select(COLUMNS)
			.eq("saison_id", saisonId);

		if (error) {
			throw new Error(
				`Stände zur Saison konnten nicht geladen werden: ${error.message}`,
			);
		}

		return data;
	},
);

/**
 * Gibt alle Saisons zurück, die mit dem angegebenen Stand verknüpft sind.
 */
export const getSaisonsByStandId = cache(
	async (standId: string): Promise<Tables<typeof TABLE>[]> => {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from(TABLE)
			.select(COLUMNS)
			.eq("stand_id", standId);

		if (error) {
			throw new Error(
				`Saisons zum Stand konnten nicht geladen werden: ${error.message}`,
			);
		}

		return data;
	},
);
