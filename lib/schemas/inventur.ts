import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const inventurSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	produkt_id: uuidSchema,
	profil_id: uuidSchema,
	datum: dateSchema,
	differenz: z.int(),
	grund: z.string().nullable(),
});

export const inventurInsertSchema = inventurSchema.omit({
	id: true,
});
export type Inventur = z.infer<typeof inventurSchema>;
export type InventurInsert = z.infer<typeof inventurInsertSchema>;
