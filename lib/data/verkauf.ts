import { createCrud } from "@/lib/data/crud";
import { getCurrentProfilId } from "@/lib/data/session";
import { positionInsertSchema } from "@/lib/schemas/position";
import { verkaufInsertSchema } from "@/lib/schemas/verkauf";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// Positionen tragen ihre verkauf_id erst nach dem Kopf-Insert (via RPC), daher
// wird sie für die Vorab-Validierung ausgeblendet.
const positionRpcSchema = positionInsertSchema.omit({ verkauf_id: true });

const TABLE = "tb_verkauf";

const crud = createCrud({
	table: TABLE,
	insertSchema: verkaufInsertSchema,
	labels: { singular: "Verkauf", plural: "Verkäufe" },
});

export const getVerkaeufe = crud.getAll;
export const getVerkauf = crud.getById;
export const getVerkaeufeBySaisonId = crud.getBySaisonId;
export const updateVerkauf = crud.update;
export const deleteVerkauf = crud.remove;

/**
 * Erstellt einen Verkauf mit N Positionen in einer atomaren DB-Transaktion
 * (via RPC). profil_id wird serverseitig aus der aktuellen Session injiziert.
 */
export async function createVerkaufMitPositionen(
	kopf: Omit<Parameters<typeof crud.create>[0], "profil_id" | "verkauft_am">,
	positionen: Array<{
		produkt_id: string;
		menge: number;
		einzelpreis: number;
		kreuz_montiert?: boolean;
		hoehe_cm: number;
	}>,
): Promise<Tables<"tb_verkauf">> {
	const supabase = await createClient();

	const profilId = await getCurrentProfilId();
	// Kopf erst nach dem Injizieren der Session-Felder validieren, damit das
	// vollständige Insert-Objekt geprüft wird (analog zu crud.create()).
	const kopfMitSession = verkaufInsertSchema.parse({
		...kopf,
		profil_id: profilId,
	});
	const gepruefePositionen = positionen.map((p) => positionRpcSchema.parse(p));

	const { data, error } = await supabase.rpc("create_verkauf_mit_positionen", {
		p_verkauf: kopfMitSession,
		p_positionen: gepruefePositionen,
	});

	if (error) {
		throw new Error(`Verkauf konnte nicht angelegt werden: ${error.message}`);
	}

	return data;
}
