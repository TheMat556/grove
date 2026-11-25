import { z } from "zod";

/** RFC-4122-UUID. Alle IDs im System sind v4: gen_random_uuid, Supabase-Auth, Seed. */
export const uuidSchema = z.uuid("Ungültige UUID");
export const numericSchema = z.coerce.number().nonnegative();
export const dateSchema = z.iso.date("Ungültiges Datum");
