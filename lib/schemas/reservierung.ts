import { z } from "zod";
import { toIsoDate } from "@/lib/saison";
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

/**
 * Anlegen-Schema: das geplante Datum darf nicht in der Vergangenheit liegen
 * (Betriebs-Kalender). Bewusst NICHT im insertSchema, weil createCrud dort ein
 * refinement-freies ZodObject für .partial() beim Update verlangt – beim
 * Bearbeiten bleiben alte Termine erlaubt.
 */
export const reservierungCreateSchema = reservierungInsertSchema.refine(
	(reservierung) => reservierung.geplantes_datum >= toIsoDate(new Date()),
	{
		message: "Geplantes Datum darf nicht in der Vergangenheit liegen.",
		path: ["geplantes_datum"],
	},
);

export type Reservierung = z.infer<typeof reservierungSchema>;
export type ReservierungInsert = z.infer<typeof reservierungInsertSchema>;
