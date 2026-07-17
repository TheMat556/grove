import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createTestClient() {
	return createClient<Database>(
		process.env.SUPABASE_TEST_URL!,
		process.env.SUPABASE_TEST_SERVICE_KEY!,
	);
}
