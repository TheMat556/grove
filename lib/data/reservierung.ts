import { createClient } from "@/lib/supabase/server";
import {
	type Reservierung,
	type ReservierungInsert,
	reservierungInsertSchema,
	reservierungSchema,
} from "@/lib/schemas/reservierung";

const TABLE = "tb_reservierung";

export async function getReservierungen(): Promise<Reservierung[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("reserviert_am", { ascending: false });

	if (error) {
		throw new Error(`Reservierungen konnten nicht geladen werden: ${error.message}`);
	}

	return reservierungSchema.array().parse(data);
}

export async function getReservierungenByStand(standId: string): Promise<Reservierung[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("stand_id", standId)
		.order("reserviert_am", { ascending: false });

	if (error) {
		throw new Error(`Reservierungen konnten nicht geladen werden: ${error.message}`);
	}

	return reservierungSchema.array().parse(data);
}

/**
 * status ist im Insert-Schema ausgeklammert und fällt auf den DB-Default
 * ('offen') zurück.
 */
export async function createReservierung(input: ReservierungInsert): Promise<Reservierung> {
	const werte = reservierungInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).insert(werte).select().single();

	if (error) {
		throw new Error(`Reservierung konnte nicht angelegt werden: ${error.message}`);
	}

	return reservierungSchema.parse(data);
}

export async function updateReservierungStatus(
	id: string,
	status: Reservierung["status"],
): Promise<Reservierung> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).update({ status }).eq("id", id).select().single();

	if (error) {
		throw new Error(`Reservierungsstatus konnte nicht aktualisiert werden: ${error.message}`);
	}

	return reservierungSchema.parse(data);
}
