import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const kundeSchema = z.object({
	id: uuidSchema,
	name: z.string().trim().min(1, "Name ist erforderlich."),
	telefon: z
		.string()
		.trim()
		.regex(/(?:\D*\d){8}/, "Telefonnummer mit mindestens 8 Ziffern."),
	plz: z.string().regex(/^[1-9]\d{3}$/, "PLZ zwischen 1000 und 9999."),
	adresse: z.string().trim().min(1, "Adresse ist erforderlich."),
	ist_firma: z.boolean(),
});

export const kundeInsertSchema = kundeSchema.omit({ id: true });
export type Kunde = z.infer<typeof kundeSchema>;
export type KundeInsert = z.infer<typeof kundeInsertSchema>;
