import { z } from "zod";

export const uuidSchema = z.string().uuid("Ungültige UUID");
export const numericSchema = z.coerce.number().nonnegative();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
