import { toIsoDate } from "@/lib/saison";

export const UMSATZ_ZEITRAEUME = [
	{ wert: "heute", label: "Heute" },
	{ wert: "dreiTage", label: "Letzte 3 Tage" },
	{ wert: "woche", label: "Letzte Woche" },
	{ wert: "gesamt", label: "Gesamte Saison" },
] as const;

export type UmsatzZeitraum = (typeof UMSATZ_ZEITRAEUME)[number]["wert"];

export type UmsatzVerkauf = {
	stand_id: string;
	stand: string;
	verkauft_am: string;
	preis_gesamt: number;
};

export type UmsatzProStandZeile = {
	standId: string;
	stand: string;
	umsatz: number;
	anzahl: number;
};

/** Erster Tag des Zeitraums als Offset in Tagen vor heute; fehlt = ganze Saison. */
const ZEITRAUM_TAGE: Partial<Record<UmsatzZeitraum, number>> = {
	heute: 0,
	dreiTage: 2,
	woche: 6,
};

/** ISO-Datum vor `tage` Tagen (heute = 0), im Betriebs-Kalender. */
function grenzTag(heute: string, tage: number) {
	const tag = new Date(`${heute}T00:00:00Z`);
	tag.setUTCDate(tag.getUTCDate() - tage);
	return tag.toISOString().slice(0, 10);
}

/**
 * Umsatz je Stand im gewählten Zeitraum, absteigend sortiert. Zeiträume sind
 * inklusive heute: "Letzte 3 Tage" = heute + 2 Tage davor, "Letzte Woche" = 7
 * Kalendertage inklusive heute.
 */
export function umsatzProStand(
	verkaeufe: UmsatzVerkauf[],
	zeitraum: UmsatzZeitraum,
	now = new Date(),
): UmsatzProStandZeile[] {
	const heute = toIsoDate(now);
	const zeitTage = ZEITRAUM_TAGE[zeitraum];
	const grenze = zeitTage === undefined ? undefined : grenzTag(heute, zeitTage);

	const proStand = new Map<string, UmsatzProStandZeile>();
	for (const verkauf of verkaeufe) {
		const tag = toIsoDate(new Date(verkauf.verkauft_am));
		if (grenze && tag < grenze) continue;

		const zeile = proStand.get(verkauf.stand_id);
		if (zeile) {
			zeile.umsatz += verkauf.preis_gesamt;
			zeile.anzahl += 1;
		} else {
			proStand.set(verkauf.stand_id, {
				standId: verkauf.stand_id,
				stand: verkauf.stand,
				umsatz: verkauf.preis_gesamt,
				anzahl: 1,
			});
		}
	}

	return [...proStand.values()].sort((a, b) => b.umsatz - a.umsatz);
}
