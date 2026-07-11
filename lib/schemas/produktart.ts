import { z } from "zod";
import {uuidSchema} from "@/lib/schemas/common";

export const produktartSchema = z.object({
	id: uuidSchema,
	produktart: z.enum(['Baum', 'Kreuz'])
});

export const produktartInsertSchema = produktartSchema.omit({ id: true });
export type Produktart = z.infer<typeof produktartSchema>;
export type ProduktartInsert = z.infer<typeof produktartInsertSchema>;
