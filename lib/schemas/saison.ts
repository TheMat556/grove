import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const saisonSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1, "Saison ist erforderlich."),
	start_datum: dateSchema,
	end_datum: dateSchema,
	active: z.boolean().default(false),
});

/**
 * Basis-Insert-Schema (ohne feldübergreifende Regeln). Wird für Teil-Updates
 * genutzt, da .partial() nur auf refinement-freien ZodObjects funktioniert.
 */
export const saisonInsertSchema = saisonSchema.omit({ id: true });

/**
 * Vollständiges Anlegen: zusätzlich zur Basis gilt, dass das Enddatum nicht vor
 * dem Startdatum liegen darf. Die Regel wandert hiermit aus der Server Action in
 * das Schema, damit sie überall greift, wo eine Saison angelegt wird.
 */
export const saisonCreateSchema = saisonInsertSchema.refine(
	(werte) => werte.end_datum >= werte.start_datum,
	{
		message: "Enddatum darf nicht vor dem Startdatum liegen.",
		path: ["end_datum"],
	},
);

export type Saison = z.infer<typeof saisonSchema>;
export type SaisonInsert = z.infer<typeof saisonInsertSchema>;
