import { createCrud } from "@/lib/data/crud";
import { getCurrentProfilId } from "@/lib/data/session";
import { uuidSchema } from "@/lib/schemas/common";
import {
	type ReservierungInsert,
	reservierungInsertSchema,
} from "@/lib/schemas/reservierung";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "tb_reservierung";

const crud = createCrud({
	table: TABLE,
	insertSchema: reservierungInsertSchema,
	// profil_id ist kein Client-Feld, wird aber beim Anlegen mitgeschrieben.
	createSchema: reservierungInsertSchema.extend({ profil_id: uuidSchema }),
	labels: { singular: "Reservierung", plural: "Reservierungen" },
});

export const createReservierung = crud.create;
export const updateReservierung = crud.update;
export const deleteReservierung = crud.remove;

/** Legt eine Reservierung an; profil_id kommt aus der Session, nicht vom Client. */
export async function createReservierungMitProfil(input: ReservierungInsert) {
	const profilId = await getCurrentProfilId();
	return createReservierung({ ...input, profil_id: profilId });
}

/**
 * Legt eine Reservierung an und verknüpft sie optional mit einem Verkauf – beides
 * in einer DB-Transaktion. Ist der Verkauf bereits verknüpft, schlägt der Aufruf
 * fehl und es wird keine Reservierung angelegt (kein stilles Überschreiben).
 */
export async function createReservierungMitVerkauf(
	input: ReservierungInsert,
	verkaufId: string,
) {
	const profilId = await getCurrentProfilId();
	const supabase = await createClient();
	const { data, error } = await supabase.rpc(
		"create_reservierung_mit_verkauf",
		{
			p_reservierung: { ...input, profil_id: profilId },
			p_verkauf_id: verkaufId,
		},
	);

	if (error) {
		throw new Error(
			`Reservierung konnte nicht angelegt werden: ${error.message}`,
		);
	}

	return data;
}

export type ReservierungMitDetails = Tables<"tb_reservierung"> & {
	// Standort für die Adresse im Dashboard (Google-Maps-Link).
	stand:
		| (Tables<"tb_stand"> & { standort: Tables<"tb_standort"> | null })
		| null;
	kunde: Tables<"tb_kunde"> | null;
};

/** Reservierungen einer Saison inkl. Stand (mit Standort) und Kunde. */
export async function getReservierungenMitDetails(
	saisonId: string,
): Promise<ReservierungMitDetails[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*, stand:tb_stand(*, standort:tb_standort(*)), kunde:tb_kunde(*)")
		.eq("saison_id", saisonId)
		.order("geplantes_datum");
	if (error) {
		throw new Error(
			`Reservierungen konnten nicht geladen werden: ${error.message}`,
		);
	}
	return (data ?? []) as ReservierungMitDetails[];
}
