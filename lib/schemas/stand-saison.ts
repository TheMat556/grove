import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const standSaisonSchema = z.object({
	stand_id: uuidSchema,
	saison_id: uuidSchema,
});

export const standSaisonInsertSchema = standSaisonSchema;
export type StandSaison = z.infer<typeof standSaisonSchema>;
export type StandSaisonInsert = z.infer<typeof standSaisonInsertSchema>;
