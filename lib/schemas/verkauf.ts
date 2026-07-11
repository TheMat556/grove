import { z } from "zod";
import { uuidSchema, numericSchema} from "@/lib/schemas/common";

export const verkaufSchema = z.object({
	id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	reservierung_id: uuidSchema.nullable(),
	aktion_bz: z.string().nullable(),
	preis_gesamt: numericSchema,
	anmerkung: z.string().nullable(),
	verkauft_am: z.string().datetime()
});

export const verkaufInsertSchema = verkaufSchema.omit({
	id: true,
	verkauft_am: true,
	reservierung_id: true, /* TODO: OPEN wird im gleichen Screen erstellt*/
});

export type	Verkauf = z.infer<typeof verkaufSchema>;
export type	VerkaufInsert = z.infer<typeof verkaufInsertSchema>;
