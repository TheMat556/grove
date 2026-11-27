import { toIsoDate } from "@/lib/saison";

/**
 * Anzahl Ereignisse pro Kalendertag (Betriebs-Zeitzone) der letzten `tage` Tage,
 * lückenlos mit 0 gefüllt. `zeitpunkte` dürfen Zeitstempel oder ISO-Daten sein.
 */
export function zaehlungenProTag(
	zeitpunkte: string[],
	tage: number,
	now = new Date(),
): number[] {
	const heute = new Date(`${toIsoDate(now)}T00:00:00Z`);
	const proTag = new Map<string, number>();

	for (let i = tage - 1; i >= 0; i--) {
		const tag = new Date(heute);
		tag.setUTCDate(tag.getUTCDate() - i);
		proTag.set(tag.toISOString().slice(0, 10), 0);
	}

	for (const zeitpunkt of zeitpunkte) {
		const tag = toIsoDate(new Date(zeitpunkt));
		const bisher = proTag.get(tag);
		if (bisher !== undefined) proTag.set(tag, bisher + 1);
	}

	return [...proTag.values()];
}
