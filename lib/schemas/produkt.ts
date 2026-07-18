import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const produktSchema = z.object({
	id: uuidSchema,
	art: z.enum(["Baum", "Kreuz"]),
	bezeichnung: z.string().min(1, "Bezeichnung erforderlich!"),
	von_cm: z.number().nonnegative(),
	bis_cm: z.number().nonnegative(),
});

/**
 * Basis-Insert-Schema (ohne feldübergreifende Regeln). Wird für Teil-Updates
 * genutzt, da .partial() nur auf refinement-freien ZodObjects funktioniert.
 */
export const produktInsertSchema = produktSchema.omit({ id: true });

/**
 * Vollständiges Anlegen: zusätzlich gilt, dass bis_cm nicht kleiner als von_cm
 * sein darf (spiegelt CHECK produkt_cm_bereich_gueltig in der Migration).
 */
export const produktCreateSchema = produktInsertSchema.refine(
	(werte) => werte.bis_cm >= werte.von_cm,
	{
		message: "bis_cm darf nicht kleiner als von_cm sein.",
		path: ["bis_cm"],
	},
);

export type Produkt = z.infer<typeof produktSchema>;
export type ProduktInsert = z.infer<typeof produktInsertSchema>;
