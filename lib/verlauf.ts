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
	const heute = new Date(`${toIsoDate(now)}T00:00:00Z`).getTime();
	const werte = Array.from({ length: tage }, () => 0);

	for (const zeitpunkt of zeitpunkte) {
		const tag = new Date(
			`${toIsoDate(new Date(zeitpunkt))}T00:00:00Z`,
		).getTime();
		const diff = (heute - tag) / 86_400_000;
		if (diff >= 0 && diff < tage) werte[tage - 1 - diff] += 1;
	}

	return werte;
}
