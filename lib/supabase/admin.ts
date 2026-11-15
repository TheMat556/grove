import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client mit Service-Role-Key für Auth-Admin-Operationen (z. B. Profile
 * anlegen). Der Key umgeht RLS – dieses Modul darf deshalb nur serverseitig
 * importiert werden. In Client-Components scheitert der Import an
 * "server-only".
 */
export function createAdminClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceKey) {
		throw new Error(
			"SUPABASE_SERVICE_ROLE_KEY fehlt – Profile können nur mit Service-Role-Key angelegt werden.",
		);
	}

	return createClient<Database>(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
