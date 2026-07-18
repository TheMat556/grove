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
export type Profil = z.infer<typeof profilSchema>;
export type ProfilInsert = z.infer<typeof profilInsertSchema>;
