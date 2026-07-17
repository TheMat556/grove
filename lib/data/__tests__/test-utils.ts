// @vitest-environment node
import { createTestClient } from "@/lib/supabase/test";

const supabase = createTestClient();

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
export async function createTestProfil(
	overrides: Record<string, unknown> = {},
) {
	const email = uniqueEmail();

	const { data: authData, error: authError } =
		await supabase.auth.admin.createUser({
			email,
			password: "test123",
			email_confirm: true,
		});
	if (authError) throw authError;

	const { data, error } = await supabase
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
		await supabase.auth.admin.deleteUser(authData.user.id);
		throw error;
	}

	return data!;
}

/**
 * Deletes an auth user by their ID. The matching tb_profil row is
 * cascade-deleted via the FK constraint.
 */
export async function deleteTestAuthUser(userId: string) {
	const { error } = await supabase.auth.admin.deleteUser(userId);
	if (error) throw error;
}
