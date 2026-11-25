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

export const updateVerkauf = crud.update;
export const deleteVerkauf = crud.remove;

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
 * Ändert Kopf und Positionen (Positionen werden ersetzt).
 * ponytail: Kopf-Update und Positions-Tausch laufen ohne DB-Transaktion; ein
 * Fehler mittendrin hinterlässt einen unvollständigen Verkauf – RPC erst, wenn
 * das real wird.
 */
export async function updateVerkaufMitPositionen(
	id: string,
	kopf: Pick<Tables<"tb_verkauf">, "stand_id" | "aktion_bz" | "anmerkung">,
	positionen: VerkaufFormInput["positionen"],
): Promise<Tables<"tb_verkauf">> {
	const supabase = await createClient();

	const verkauf = await updateVerkauf(id, {
		stand_id: kopf.stand_id,
		aktion_bz: kopf.aktion_bz,
		anmerkung: kopf.anmerkung,
		preis_gesamt: preisGesamt(positionen),
	});

	const { error: deleteError } = await supabase
		.from("tb_position")
		.delete()
		.eq("verkauf_id", id);

	if (deleteError) {
		throw new Error(
			`Positionen konnten nicht ersetzt werden: ${deleteError.message}`,
		);
	}

	const { error: insertError } = await supabase
		.from("tb_position")
		.insert(positionen.map((position) => ({ ...position, verkauf_id: id })));

	if (insertError) {
		throw new Error(
			`Positionen konnten nicht gespeichert werden: ${insertError.message}`,
		);
	}

	return verkauf;
}

/** Löscht einen Verkauf inkl. Positionen (Positionen zuerst wegen FK). */
export async function deleteVerkaufMitPositionen(id: string): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase
		.from("tb_position")
		.delete()
		.eq("verkauf_id", id);

	if (error) {
		throw new Error(
			`Positionen konnten nicht gelöscht werden: ${error.message}`,
		);
	}

	await deleteVerkauf(id);
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
