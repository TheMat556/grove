// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTestClient } from "@/lib/supabase/test";
import { createCrud } from "@/lib/data/crud";
import type { CrudConfig } from "@/lib/data/crud";
import type { Database } from "@/lib/supabase/database.types";
type TableName = keyof Database["public"]["Tables"];

const supabase =
	process.env.SUPABASE_TEST_URL && process.env.SUPABASE_TEST_SERVICE_KEY
		? createTestClient()
		: null;

export function getClient(): SupabaseClient<Database> {
	if (!supabase)
		throw new Error("SUPABASE_TEST_URL / SUPABASE_TEST_SERVICE_KEY not set");
	return supabase;
}

/**
 * Erzeugt eine testbare CRUD-Instanz, die den Test-Supabase-Client
 * verwendet statt des Server-Clients (der in Tests nicht funktioniert).
 */
export function createTestCrud<T extends TableName>(
	config: Omit<CrudConfig<T>, "createClient">,
) {
	return createCrud<T>({
		...config,
		createClient: async () => getClient() as unknown as SupabaseClient,
	});
}

let uidCounter = 0;

function uniqueEmail(): string {
	uidCounter++;
	return `test-${Date.now()}-${uidCounter}@test.test`;
}

export async function createTestProfil(
	overrides: Record<string, unknown> = {},
) {
	const client = getClient();
	const email = uniqueEmail();

	const { data: authData, error: authError } =
		await client.auth.admin.createUser({
			email,
			password: "test123",
			email_confirm: true,
		});
	if (authError) throw authError;

	const { data, error } = await client
		.from("tb_profil")
		.insert({
			id: authData.user.id,
			name: `test-${Math.random().toString(36).slice(2, 8)}`,
			rolle: "mitarbeiter",
			telefon: null,
			aktiv: true,
			...overrides,
		})
		.select()
		.single();

	if (error) {
		await client.auth.admin.deleteUser(authData.user.id);
		throw error;
	}

	return data!;
}

/**
 * Deletes an auth user by their ID. The matching tb_profil row is
 * cascade-deleted via the FK constraint.
 */
export async function deleteTestAuthUser(userId: string) {
	const { error } = await getClient().auth.admin.deleteUser(userId);
	if (error) throw error;
}
