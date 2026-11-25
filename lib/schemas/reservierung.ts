import { z } from "zod";
import { dateSchema, numericSchema, uuidSchema } from "@/lib/schemas/common";

const statusSchema = z.enum(["offen", "erfuellt", "storniert"]);

export const reservierungSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: z.uuid("Ungültiger Stand."),
	profil_id: uuidSchema,
	kunde_id: z.uuid("Ungültiger Kunde."),
	versandart: z.enum(["abholung", "lieferung"]),
	geplantes_datum: dateSchema,
	status: statusSchema,
	anzahlungsbetrag: numericSchema.nullable(),
	anmerkung: z.string().nullable(),
	reserviert_am: z.string().datetime(),
});

export const reservierungInsertSchema = reservierungSchema
	.omit({
		id: true,
		reserviert_am: true,
		profil_id: true,
	})
	.extend({
		// profil_id wird serverseitig aus der Session injiziert
		// (createReservierungMitProfil) und ist kein Client-Feld.
		// DB-Default 'offen'; das Bearbeiten-Formular setzt den Status.
		status: statusSchema.optional(),
		// Im Insert optional — beim Anlegen wird kein Anzahlungsbetrag erwartet.
		// DB-Spalte ist nullable, DB-Default ist NULL.
		anzahlungsbetrag: numericSchema.nullable().optional(),
		// Freitext, optional (nullable).
		anmerkung: z.string().nullable().optional(),
	});

export type Reservierung = z.infer<typeof reservierungSchema>;
export type ReservierungInsert = z.infer<typeof reservierungInsertSchema>;
