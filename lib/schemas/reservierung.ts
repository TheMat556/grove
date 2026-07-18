import { z } from "zod";
import { dateSchema, numericSchema, uuidSchema } from "@/lib/schemas/common";

export const reservierungSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	kunde_id: uuidSchema,
	versandart: z.enum(["abholung", "lieferung"]),
	geplantes_datum: dateSchema,
	status: z.enum(["offen", "erfuellt", "storniert"]),
	anzahlungsbetrag: numericSchema.nullable(),
	reserviert_am: z.string().datetime(),
});

export const reservierungInsertSchema = reservierungSchema
	.omit({
		id: true,
		reserviert_am: true,
		status: true,
	})
	.extend({
		// Im Insert optional — beim Anlegen wird kein Anzahlungsbetrag erwartet.
		// DB-Spalte ist nullable, DB-Default ist NULL.
		anzahlungsbetrag: numericSchema.nullable().optional(),
	});

export type Reservierung = z.infer<typeof reservierungSchema>;
export type ReservierungInsert = z.infer<typeof reservierungInsertSchema>;
