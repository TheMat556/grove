import { z } from "zod";
import {dateSchema, uuidSchema} from "@/lib/schemas/common";

export const saisonSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1, "Saison ist erforderlich."),
	start_datum: dateSchema,
	end_datum: dateSchema
});

export const saisonInsertSchema = saisonSchema.omit({ id: true });
export type Saison = z.infer<typeof saisonSchema>;
export type SaisonInsert = z.infer<typeof saisonInsertSchema>;
