import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const kundeSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1, "Name ist erforderlich."),
	telefon: z.string().min(1, "Telefon ist erforderlich"),
	adresse: z.string().min(1, "Adresse ist erforderlich"),
	ist_firma: z.boolean(),
});

export const kundeInsertSchema = kundeSchema.omit({ id: true });
export type Kunde = z.infer<typeof kundeSchema>;
export type KundeInsert = z.infer<typeof kundeInsertSchema>;
