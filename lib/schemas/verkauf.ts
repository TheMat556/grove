import { z } from "zod";
import { numericSchema, uuidSchema } from "@/lib/schemas/common";
import { positionInsertSchema } from "@/lib/schemas/position";

export const verkaufSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	reservierung_id: uuidSchema.nullable(),
	aktion_bz: z.string().nullable(),
	preis_gesamt: numericSchema,
	anmerkung: z.string().nullable(),
	verkauft_am: z.string().datetime(),
});

export const verkaufInsertSchema = verkaufSchema.omit({
	id: true,
	verkauft_am: true,
});

export type Verkauf = z.infer<typeof verkaufSchema>;
export type VerkaufInsert = z.infer<typeof verkaufInsertSchema>;

/** Cent-genauer Preis: NUMERIC(10,2) in der DB würde sonst still runden. */
const centPreisSchema = numericSchema.refine(
	(preis) => Math.abs(preis * 100 - Math.round(preis * 100)) < 1e-6,
	"Einzelpreis mit höchstens zwei Nachkommastellen.",
);

/** Eine Position, wie sie das Verkaufsformular liefert (ohne verkauf_id). */
export const verkaufPositionSchema = positionInsertSchema
	.omit({ verkauf_id: true })
	.extend({ einzelpreis: centPreisSchema });

/**
 * Formular-Input für einen Verkauf: Kopf ohne die serverseitig bestimmten
 * Felder (profil_id, preis_gesamt) und ohne Reservierung, plus Positionen.
 * Die DB-Funktion validiert die Positionen erneut.
 */
export const verkaufFormSchema = verkaufInsertSchema
	.omit({ profil_id: true, preis_gesamt: true, reservierung_id: true })
	.extend({
		positionen: z
			.array(verkaufPositionSchema)
			.min(1, "Mindestens eine Position angeben."),
	});

export type VerkaufFormInput = z.infer<typeof verkaufFormSchema>;

/** Gesamtpreis aus den Positionen, auf Cent gerundet. */
export function preisGesamt(
	positionen: Array<{ menge: number; einzelpreis: number }>,
) {
	const summe = positionen.reduce((s, p) => s + p.menge * p.einzelpreis, 0);
	return Math.round(summe * 100) / 100;
}
