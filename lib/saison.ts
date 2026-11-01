import type { Tables } from "@/lib/supabase/database.types";

/** Cookie, in dem die gewählte Saison gespeichert wird. */
export const SAISON_COOKIE = "saison_id";
/** Cookie-Wert für "Alle Saisons". */
export const SAISON_ALL = "all";

export type Saison = Tables<"tb_saison">;

/**
 * Eine Saison ist aktiv, solange heute zwischen Start- und Enddatum liegt.
 * Datumswerte sind ISO-Strings (yyyy-mm-dd), daher reicht ein String-Vergleich.
 */
export function istAktiv(start: string, end: string, now = new Date()) {
	const monat = String(now.getMonth() + 1).padStart(2, "0");
	const tag = String(now.getDate()).padStart(2, "0");
	const heute = `${now.getFullYear()}-${monat}-${tag}`;
	return start <= heute && heute <= end;
}

/**
 * Standard-Auswahl der Saison: die per Flag aktive, sonst die laut Datum
 * laufende, sonst die zuletzt gestartete Saison.
 */
export function defaultSaison(
	saisons: Saison[],
	now = new Date(),
): Saison | undefined {
	return (
		saisons.find((saison) => saison.active) ??
		saisons.find((saison) =>
			istAktiv(saison.start_datum, saison.end_datum, now),
		) ??
		[...saisons].sort((a, b) => b.start_datum.localeCompare(a.start_datum))[0]
	);
}
