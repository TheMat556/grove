import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const standortSchema = z.object({
	id: uuidSchema,
	plz: z.number().int().min(1000).max(9999),
	ort: z.string().min(1, "Ort ist erforderlich."),
	adresse: z.string().min(1, "Adresse ist erforderlich."),
});

export const standortInsertSchema = standortSchema.omit({ id: true });
export type Standort = z.infer<typeof standortSchema>;
export type StandortInsert = z.infer<typeof standortInsertSchema>;
