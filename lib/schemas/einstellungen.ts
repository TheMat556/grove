import { z } from "zod";

/** Uhrzeit als HH:MM, wie sie das Formular (input type="time") liefert. */
const uhrzeitSchema = z.iso.time({ error: "Uhrzeit im Format HH:MM angeben." });

/**
 * Änderbare Felder der globalen Einstellungen. Die SMS-Erinnerung für
 * Lieferungen geht `sms_vorlauf_tage` Tage vor dem geplanten Lieferdatum um
 * `sms_uhrzeit` raus (0 Tage = am Liefertag selbst).
 */
export const einstellungenUpdateSchema = z.object({
	sms_aktiv: z.boolean(),
	// Formular liefert Strings. Erst als String prüfen, damit ein leeres Feld
	// nicht über z.coerce zu 0 wird und still "am Liefertag" bedeutet.
	sms_vorlauf_tage: z
		.string()
		.trim()
		.min(1, "Vorlaufzeit angeben.")
		.regex(/^\d+$/, "Ganze Tage angeben.")
		.transform(Number)
		.refine((tage) => tage <= 30, "Höchstens 30 Tage Vorlauf."),
	sms_uhrzeit: uhrzeitSchema,
});

export type EinstellungenUpdate = z.infer<typeof einstellungenUpdateSchema>;
