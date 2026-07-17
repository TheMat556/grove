import { z } from "zod";
import { numericSchema, uuidSchema } from "@/lib/schemas/common";

export const positionSchema = z.object({
	id: uuidSchema,
	verkauf_id: uuidSchema,
	produkt_id: uuidSchema,
	menge: z.number().int().positive("Menge muss > 0 sein."),
	einzelpreis: numericSchema,
	kreuz_montiert: z.boolean(),
	hoehe_cm: z.number().int().nonnegative(),
});

export const positionInsertSchema = positionSchema.omit({ id: true });
export type Position = z.infer<typeof positionSchema>;
export type PositionInsert = z.infer<typeof positionInsertSchema>;
