import "server-only";
import { cache } from "react";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Liefert den aktuell angemeldeten auth.users-Benutzer (oder null).
 * Pro Request memoisiert, damit alle Session-Helfer nur einen Lookup teilen.
 */
const getCurrentUser = cache(async () => {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();
	return error ? null : (data.user ?? null);
});

/**
 * Liefert die aktuell angemeldete Benutzer-ID (auth.users.id = tb_profil.id).
 * Wirft, wenn kein Benutzer angemeldet ist.
 */
export async function getCurrentProfilId(): Promise<string> {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Nicht angemeldet.");
	}

	return user.id;
}

/** Liefert die E-Mail des aktuellen auth.users-Benutzers. */
export async function getCurrentProfilEmail(): Promise<string> {
	const user = await getCurrentUser();
	return user?.email ?? "";
}

/**
 * Liefert das vollständige tb_profil des aktuellen Benutzers.
 * Pro Request memoisiert (React cache).
 */
export const getCurrentProfil = cache(
	async (): Promise<Tables<"tb_profil">> => {
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

		return data;
	},
);
