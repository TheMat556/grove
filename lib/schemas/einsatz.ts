import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

const einsatzBaseSchema = z.object({
	id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	von: dateSchema,
	bis: dateSchema.nullable(),
});

// bis darf nicht vor von liegen (NULL = laufender Einsatz).
const zeitraumGueltig = (e: { von: string; bis: string | null }) => e.bis === null || e.bis >= e.von;
const zeitraumError = {
	message: "Enddatum darf nicht vor dem Startdatum liegen.",
	path: ["bis"],
};

export const einsatzSchema = einsatzBaseSchema.refine(zeitraumGueltig, zeitraumError);
export const einsatzInsertSchema = einsatzBaseSchema.omit({ id: true }).refine(zeitraumGueltig, zeitraumError);

export type Einsatz = z.infer<typeof einsatzSchema>;
export type EinsatzInsert = z.infer<typeof einsatzInsertSchema>;
