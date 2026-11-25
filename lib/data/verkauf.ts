import { createCrud } from "@/lib/data/crud";
import { getCurrentProfilId } from "@/lib/data/session";
import {
	preisGesamt,
	type VerkaufFormInput,
	verkaufInsertSchema,
} from "@/lib/schemas/verkauf";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "tb_verkauf";

const crud = createCrud({
	table: TABLE,
	insertSchema: verkaufInsertSchema,
	labels: { singular: "Verkauf", plural: "Verkäufe" },
});

/**
 * Erstellt einen Verkauf mit N Positionen in einer atomaren DB-Transaktion
 * (via RPC). profil_id wird serverseitig aus der aktuellen Session injiziert.
 */
export async function createVerkaufMitPositionen(
	kopf: Omit<Parameters<typeof crud.create>[0], "profil_id" | "verkauft_am">,
	positionen: VerkaufFormInput["positionen"],
): Promise<Tables<"tb_verkauf">> {
	const supabase = await createClient();

	const profilId = await getCurrentProfilId();
	// Kopf erst nach dem Injizieren der Session-Felder validieren, damit das
	// vollständige Insert-Objekt geprüft wird (analog zu crud.create()).
	const kopfMitSession = verkaufInsertSchema.parse({
		...kopf,
		profil_id: profilId,
	});

	const { data, error } = await supabase.rpc("create_verkauf_mit_positionen", {
		p_verkauf: kopfMitSession,
		p_positionen: positionen,
	});

	if (error) {
		throw new Error(`Verkauf konnte nicht angelegt werden: ${error.message}`);
	}

	return data;
}

export type VerkaufMitDetails = Tables<"tb_verkauf"> & {
	stand: Tables<"tb_stand"> | null;
	verkaeufer: Tables<"tb_profil"> | null;
	reservierung:
		| (Tables<"tb_reservierung"> & { kunde: Tables<"tb_kunde"> | null })
		| null;
	positionen: Array<
		Tables<"tb_position"> & { produkt: Tables<"tb_produkt"> | null }
	>;
};

/**
 * Ändert Kopf und Positionen (Positionen werden ersetzt) – atomar über eine
 * DB-Funktion: Kopf-Update, Löschen und Einfügen laufen in einer Transaktion.
 */
export async function updateVerkaufMitPositionen(
	id: string,
	kopf: Pick<Tables<"tb_verkauf">, "stand_id" | "aktion_bz" | "anmerkung">,
	positionen: VerkaufFormInput["positionen"],
): Promise<Tables<"tb_verkauf">> {
	const supabase = await createClient();
	const { data, error } = await supabase.rpc("update_verkauf_mit_positionen", {
		p_verkauf_id: id,
		p_kopf: { ...kopf, preis_gesamt: preisGesamt(positionen) },
		p_positionen: positionen,
	});

	if (error) {
		throw new Error(
			`Verkauf konnte nicht aktualisiert werden: ${error.message}`,
		);
	}

	return data;
}

/** Löscht einen Verkauf inkl. Positionen atomar über eine DB-Funktion. */
export async function deleteVerkaufMitPositionen(id: string): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase.rpc("delete_verkauf_mit_positionen", {
		p_verkauf_id: id,
	});

	if (error) {
		throw new Error(`Verkauf konnte nicht gelöscht werden: ${error.message}`);
	}
}

/**
 * Verkäufe einer Saison inkl. Stand, Verkäufer, Positionen (mit Produkt) und
 * verknüpfter Reservierung (mit Kunde) für Liste und Übersicht – in einer
 * verschachtelten Abfrage (analog getReservierungenMitDetails).
 */
export async function getVerkaeufeMitDetails(
	saisonId: string,
): Promise<VerkaufMitDetails[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			"*, stand:tb_stand(*), verkaeufer:tb_profil(*), reservierung:tb_reservierung(*, kunde:tb_kunde(*)), positionen:tb_position(*, produkt:tb_produkt(*))",
		)
		.eq("saison_id", saisonId)
		.order("verkauft_am", { ascending: false });
	if (error) {
		throw new Error(`Verkäufe konnten nicht geladen werden: ${error.message}`);
	}
	return (data ?? []) as VerkaufMitDetails[];
}
