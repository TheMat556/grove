import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const wareneingangSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	datum: dateSchema,
	erfasst_von: uuidSchema,
});

export const wareneingangInsertSchema = wareneingangSchema.omit({
	id: true,
});
export type Wareneingang = z.infer<typeof wareneingangSchema>;
export type WareneingangInsert = z.infer<typeof wareneingangInsertSchema>;
