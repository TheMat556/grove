import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const standSchema = z.object({
	id: uuidSchema,
	standort_id: uuidSchema,
	bezeichnung: z.string().min(1, "Stand ist erforderlich!"),
});

export const standInsertSchema = standSchema.omit({ id: true });
export type Stand = z.infer<typeof standSchema>;
export type StandInsert = z.infer<typeof standInsertSchema>;

/**
 * Kombiniertes UI-Schema für das Stände-Formular: Stand-Stammdaten plus
 * Standort-Felder. In der DB bleiben es zwei Tabellen (tb_stand → tb_standort).
 */
export const standMitStandortSchema = z.object({
	bezeichnung: z.string().min(1, "Bezeichnung ist erforderlich."),
	// Coerce: das Formular liefert Strings; leeres Feld -> 0 -> min/max meldet Feldfehler.
	plz: z.coerce.number().int().min(1000).max(9999),
	ort: z.string().min(1, "Ort ist erforderlich."),
	adresse: z.string().min(1, "Adresse ist erforderlich."),
});

export type StandMitStandortInput = z.infer<typeof standMitStandortSchema>;
