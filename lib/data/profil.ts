import "server-only";
import { createCrud } from "@/lib/data/crud";
import {
	type ProfilCreate,
	profilCreateSchema,
	profilInsertSchema,
} from "@/lib/schemas/profil";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const TABLE = "tb_profil";
type Row = Database["public"]["Tables"][typeof TABLE]["Row"];

const crud = createCrud({
	table: TABLE,
	insertSchema: profilInsertSchema,
	labels: { singular: "Profil", plural: "Profile" },
	orderBy: { column: "name" },
});

export const getProfile = crud.getAll;
export const updateProfil = crud.update;

/**
 * Ein Profil samt Auth-User anlegen. tb_profil.id == auth.users.id, daher muss
 * zuerst der auth.users-Eintrag entstehen (Service-Role-Client). Den
 * tb_profil-Datensatz legt der DB-Trigger an – Rolle, Telefon und Aktiv-Status
 * setzt erst der anschließende Update.
 */
export async function createProfilMitAuth(input: ProfilCreate): Promise<Row> {
	const werte = profilCreateSchema.parse(input);
	const supabase = createAdminClient();

	const { data, error } = await supabase.auth.admin.createUser({
		email: werte.email,
		password: werte.passwort,
		email_confirm: true,
		user_metadata: { name: werte.name },
	});
	if (error) {
		throw new Error(`Profil konnte nicht angelegt werden: ${error.message}`);
	}

	const { data: profil, error: profilError } = await supabase
		.from(TABLE)
		.update({
			name: werte.name,
			rolle: werte.rolle,
			telefon: werte.telefon,
			aktiv: werte.aktiv,
		})
		.eq("id", data.user.id)
		.select()
		.single();
	if (profilError) {
		// Kompensation: den eben angelegten Auth-User wieder entfernen, damit
		// kein bestätigtes Konto mit Standardprofil zurückbleibt. Scheitert das
		// ebenfalls, steht die User-ID in der Meldung, damit sie sich manuell
		// aufräumen lässt – der ursprüngliche Fehler bleibt erhalten.
		const { error: deleteError } = await supabase.auth.admin.deleteUser(
			data.user.id,
		);
		throw new Error(
			`Profil konnte nicht gespeichert werden: ${profilError.message}` +
				(deleteError
					? ` (Auth-User ${data.user.id} blieb bestehen: ${deleteError.message})`
					: ""),
		);
	}

	return profil;
}
