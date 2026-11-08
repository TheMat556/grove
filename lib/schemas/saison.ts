import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const saisonSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1, "Saison ist erforderlich."),
	start_datum: dateSchema,
	end_datum: dateSchema,
	active: z.boolean(),
});

/**
 * Basis-Insert-Schema (ohne feldübergreifende Regeln). Wird für Teil-Updates
 * genutzt, da .partial() nur auf refinement-freien ZodObjects funktioniert.
 * `active` ist optional statt Default(false): ein Zod-Default würde bei
 * Teil-Updates sonst `false` in jedes Update schreiben.
 */
export const saisonInsertSchema = saisonSchema
	.omit({ id: true })
	.extend({ active: z.boolean().optional() });

const enddatumNachStart = (werte: { start_datum: string; end_datum: string }) =>
	werte.end_datum >= werte.start_datum;

const enddatumFehler = {
	message: "Enddatum darf nicht vor dem Startdatum liegen.",
	path: ["end_datum"],
};

/**
 * Vollständiges Anlegen: zusätzlich zur Basis gilt, dass das Enddatum nicht vor
 * dem Startdatum liegen darf. Die Regel wandert hiermit aus der Server Action in
 * das Schema, damit sie überall greift, wo eine Saison angelegt wird.
 */
export const saisonCreateSchema = saisonInsertSchema.refine(
	enddatumNachStart,
	enddatumFehler,
);

/**
 * Update: `active` wird nicht vom Dialog verwaltet und bleibt darum außen vor.
 */
export const saisonUpdateSchema = saisonInsertSchema
	.omit({ active: true })
	.refine(enddatumNachStart, enddatumFehler);

export type Saison = z.infer<typeof saisonSchema>;
export type SaisonInsert = z.infer<typeof saisonInsertSchema>;
