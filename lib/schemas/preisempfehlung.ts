import {z} from "zod";
import {uuidSchema} from "@/lib/schemas/common";

export const preisempfehlungSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	produkt_id: uuidSchema,
	preis: z.number().nonnegative()
});

export const preisempfehlungInsertSchema = preisempfehlungSchema.omit({
	id: true,
	saison_id: true,
	produkt_id: true
});
export type Preisempfehlung = z.infer<typeof preisempfehlungSchema>;
export type PreisempfehlungInsert = z.infer<typeof preisempfehlungInsertSchema>;
