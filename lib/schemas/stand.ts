import {z} from "zod";
import {uuidSchema} from "@/lib/schemas/common";

export const standSchema = z.object({
	id: uuidSchema,
	standort_id: uuidSchema,
	bezeichnung: z.string().min(1, "Stand ist erforderlich!")
});

export const standInsertSchema = standSchema.omit({
	id: true,
	standort_id: true
});
export type Stand = z.infer<typeof standSchema>;
export type StandInsert = z.infer<typeof standInsertSchema>;
