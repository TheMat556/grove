import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const profilSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1, "Name ist erforderlich."),
	rolle: z.enum(["admin", "mitarbeiter"]),
	telefon: z.string().nullable(),
	aktiv: z.boolean(),
	erstellt_am: z.string().datetime(),
});

export const profilInsertSchema = profilSchema.omit({
	id: true,
	erstellt_am: true,
});

/**
 * Eingabe zum Anlegen eines Profils: zusätzlich zu den tb_profil-Spalten
 * braucht es die Zugangsdaten für den neuen auth.users-Eintrag.
 */
export const profilCreateSchema = profilInsertSchema.extend({
	email: z.email("Gültige E-Mail-Adresse erforderlich."),
	passwort: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben."),
});

export type Profil = z.infer<typeof profilSchema>;
export type ProfilInsert = z.infer<typeof profilInsertSchema>;
export type ProfilCreate = z.infer<typeof profilCreateSchema>;
