// @vitest-environment node
import { createTestClient } from "@/lib/supabase/test";

const supabase =
	process.env.SUPABASE_TEST_URL && process.env.SUPABASE_TEST_SERVICE_KEY
		? createTestClient()
		: null;

let uidCounter = 0;

function uniqueEmail(): string {
	uidCounter++;
	return `test-${Date.now()}-${uidCounter}@test.test`;
}

/**
 * Creates a real auth user in Supabase Auth, then creates a matching tb_profil entry.
 * Returns the profil record.
 * On failure, cleans up the auth user automatically.
 */
function getClient() {
	if (!supabase)
		throw new Error("SUPABASE_TEST_URL / SUPABASE_TEST_SERVICE_KEY not set");
	return supabase;
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
