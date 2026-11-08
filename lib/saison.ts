import type { Tables } from "@/lib/supabase/database.types";

/** Cookie, in dem die gewählte Saison gespeichert wird. */
export const SAISON_COOKIE = "saison_id";

export type Saison = Tables<"tb_saison">;

const isoDayFormat = new Intl.DateTimeFormat("sv-SE", {
	timeZone: "Europe/Berlin",
});
const localDayFormat = new Intl.DateTimeFormat("sv-SE");

/** Datum als ISO-Datum (yyyy-mm-dd) in der Zeitzone des Betriebs. */
export function toIsoDate(date: Date): string {
	return isoDayFormat.format(date);
}

/** Datum als ISO-Datum (yyyy-mm-dd) in der Zeitzone des Browsers. */
export function toLocalIsoDate(date: Date): string {
	return localDayFormat.format(date);
}

/** ISO-Datum (yyyy-mm-dd) als lokale Mitternacht; ungültige Werte → undefined. */
export function parseIsoDate(value: string): Date | undefined {
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Eine Saison ist aktiv, solange heute zwischen Start- und Enddatum liegt.
 * Datumswerte sind ISO-Strings (yyyy-mm-dd), daher reicht ein String-Vergleich.
 */
export function istAktiv(start: string, end: string, now = new Date()) {
	const heute = toIsoDate(now);
	return start <= heute && heute <= end;
}

/**
 * Standard-Auswahl: die früher gestartete Saison, deren Zeitraum heute liegt;
 * ohne laufende Saison die zuletzt gestartete. Das Flag `active` wird bewusst
 * ignoriert: es ändert sich nur beim Speichern und kann veralten.
 */
export function defaultSaison(
	saisons: Saison[],
	now = new Date(),
): Saison | undefined {
	const nachStart = [...saisons].sort((a, b) =>
		a.start_datum.localeCompare(b.start_datum),
	);
	return (
		nachStart.find((saison) =>
			istAktiv(saison.start_datum, saison.end_datum, now),
		) ?? nachStart.at(-1)
	);
}
