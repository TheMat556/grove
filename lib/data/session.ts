import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Liefert die aktuell angemeldete Benutzer-ID (auth.users.id = tb_profil.id).
 * Wirft, wenn kein Benutzer angemeldet ist.
 */
export async function getCurrentProfilId(): Promise<string> {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		throw new Error("Nicht angemeldet.");
	}

	return data.user.id;
}

/**
 * Liefert das vollständige tb_profil des aktuellen Benutzers.
 */
export async function getCurrentProfil(): Promise<Record<string, unknown>> {
	const supabase = await createClient();
	const profileId = await getCurrentProfilId();

	const { data, error } = await supabase
		.from("tb_profil")
		.select("*")
		.eq("id", profileId)
		.single();

	if (error || !data) {
		throw new Error("Profil konnte nicht geladen werden.");
	}

	return data as Record<string, unknown>;
}
