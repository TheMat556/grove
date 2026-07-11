import { createClient } from "@/lib/supabase/server";
import { type Profil, type ProfilInsert, profilInsertSchema, profilSchema } from "@/lib/schemas/profil";

const TABLE = "tb_profil";

export async function getProfile(): Promise<Profil[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").order("name", { ascending: true });

	if (error) {
		throw new Error(`Profile konnten nicht geladen werden: ${error.message}`);
	}

	return profilSchema.array().parse(data);
}

export async function getProfil(id: string): Promise<Profil | null> {
	const supabase = await createClient();
	const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();

	if (error) {
		throw new Error(`Profil konnte nicht geladen werden: ${error.message}`);
	}

	return data ? profilSchema.parse(data) : null;
}

/**
 * id ist die auth.users-ID und wird nicht generiert, sondern separat übergeben
 * (1:1-Erweiterung des Auth-Users).
 */
export async function createProfil(id: string, input: ProfilInsert): Promise<Profil> {
	const werte = profilInsertSchema.parse(input);

	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ ...werte, id })
		.select()
		.single();

	if (error) {
		throw new Error(`Profil konnte nicht angelegt werden: ${error.message}`);
	}

	return profilSchema.parse(data);
}
