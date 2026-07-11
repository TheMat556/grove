import { z } from "zod";
import {uuidSchema} from "@/lib/schemas/common";

export const produktSchema = z.object({
	id: uuidSchema,
	produktart_id: uuidSchema,
	bezeichnung: z.string().min(1, "Bezeichnung erforderlich!"),
	von_cm: z.number().nonnegative(),
	bis_cm: z.number().nonnegative(),
});

export const produktInsertSchema = produktSchema.omit({ id: true });
export type Produkt = z.infer<typeof produktSchema>;
export type ProduktInsert = z.infer<typeof produktInsertSchema>;
