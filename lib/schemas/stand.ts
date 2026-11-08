import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";
import { standortInsertSchema } from "@/lib/schemas/standort";

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
export const standMitStandortSchema = standInsertSchema
	.omit({ standort_id: true })
	.extend(standortInsertSchema.shape);

export type StandMitStandortInput = z.infer<typeof standMitStandortSchema>;
