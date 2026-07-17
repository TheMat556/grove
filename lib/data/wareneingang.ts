import { createCrud } from "@/lib/data/crud";
import { getCurrentProfilId } from "@/lib/data/session";
import { wareneingangInsertSchema } from "@/lib/schemas/wareneingang";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "tb_wareneingang";

const crud = createCrud({
	table: TABLE,
	insertSchema: wareneingangInsertSchema,
	labels: { singular: "Wareneingang", plural: "Wareneingänge" },
	orderBy: { column: "datum", ascending: false },
});

export const getWareneingaenge = crud.getAll;
export const getWareneingang = crud.getById;
export const getWareneingaengeBySaisonId = crud.getBySaisonId;
export const updateWareneingang = crud.update;
export const deleteWareneingang = crud.remove;

/**
 * Erzeugt einen Wareneingang mit N Positionen in einer atomaren DB-Transaktion
 * (via RPC). erfasst_von wird serverseitig aus der aktuellen Session injiziert.
 */
export async function createWareneingangMitPositionen(
	kopf: Omit<Parameters<typeof crud.create>[0], "erfasst_von">,
	positionen: Array<{
		produkt_id: string;
		menge: number;
	}>,
): Promise<Tables<"tb_wareneingang">> {
	const supabase = await createClient();

	const profilId = await getCurrentProfilId();
	const kopfMitSession = { ...kopf, erfasst_von: profilId };

	const { data, error } = await supabase.rpc(
		"create_wareneingang_mit_positionen",
		{
			p_wareneingang: kopfMitSession,
			p_positionen: positionen,
		},
	);

	if (error) {
		throw new Error(
			`Wareneingang konnte nicht angelegt werden: ${error.message}`,
		);
	}

	return data as unknown as Tables<"tb_wareneingang">;
}
