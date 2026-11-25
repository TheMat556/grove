import { z } from "zod";
import { numericSchema, uuidSchema } from "@/lib/schemas/common";

export const preisempfehlungSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	produkt_id: uuidSchema,
	// coerce parst Formular-Strings; positive statt nonnegative, damit ein leeres
	// Feld nicht stillschweigend als 0 € durchgeht.
	preis: numericSchema.positive("Preis muss größer als 0 sein."),
});

export const preisempfehlungInsertSchema = preisempfehlungSchema.omit({
	id: true,
});
export type Preisempfehlung = z.infer<typeof preisempfehlungSchema>;
export type PreisempfehlungInsert = z.infer<typeof preisempfehlungInsertSchema>;
