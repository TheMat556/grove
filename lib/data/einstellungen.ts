import "server-only";
import { cache } from "react";
import type { EinstellungenUpdate } from "@/lib/schemas/einstellungen";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type Einstellungen = Tables<"tb_einstellungen">;

/** tb_einstellungen hat genau eine Zeile (id = 1, per CHECK erzwungen). */
const EINZELNE_ZEILE = 1;

/** Globale Einstellungen; pro Request memoisiert. */
export const getEinstellungen = cache(async (): Promise<Einstellungen> => {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("tb_einstellungen")
		.select("*")
		.eq("id", EINZELNE_ZEILE)
		.single();

	if (error) {
		throw new Error(
			`Einstellungen konnten nicht geladen werden: ${error.message}`,
		);
	}

	return data;
});

/** Schreibt die geänderten Einstellungen in die eine Zeile. */
export async function updateEinstellungen(
	input: EinstellungenUpdate,
): Promise<Einstellungen> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("tb_einstellungen")
		.update(input)
		.eq("id", EINZELNE_ZEILE)
		.select()
		.single();

	if (error) {
		throw new Error(
			`Einstellungen konnten nicht gespeichert werden: ${error.message}`,
		);
	}

	return data;
}
