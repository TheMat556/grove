import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const einsatzSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	von: dateSchema,
	bis: dateSchema.nullable(),
});

/** Basis ohne Refinements – sicher für .partial() in createCrud.update(). */
export const einsatzInsertSchema = einsatzSchema.omit({ id: true });

/** Anlegen mit zusätzlicher feldübergreifender Regel: bis >= von. */
export const einsatzCreateSchema = einsatzInsertSchema.refine(
	(e) => e.bis === null || e.bis >= e.von,
	{ message: "Enddatum darf nicht vor dem Startdatum liegen.", path: ["bis"] },
);

export type Einsatz = z.infer<typeof einsatzSchema>;
export type EinsatzInsert = z.infer<typeof einsatzInsertSchema>;
export type EinsatzCreate = z.infer<typeof einsatzCreateSchema>;
