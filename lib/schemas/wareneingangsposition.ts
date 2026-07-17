import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const wareneingangpositionSchema = z.object({
	id: uuidSchema,
	wareneingang_id: uuidSchema,
	produkt_id: uuidSchema,
	menge: z.number().positive(),
});

export const wareneingangspositionInsertSchema =
	wareneingangpositionSchema.omit({
		id: true,
	});
export type Wareneingangsposition = z.infer<typeof wareneingangpositionSchema>;
export type WareneingangspositionInsert = z.infer<
	typeof wareneingangspositionInsertSchema
>;
