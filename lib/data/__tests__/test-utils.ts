// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll } from "vitest";
import type { CrudConfig } from "@/lib/data/crud";
import { createCrud } from "@/lib/data/crud";
import { kundeInsertSchema } from "@/lib/schemas/kunde";
import { produktInsertSchema } from "@/lib/schemas/produkt";
import { saisonInsertSchema } from "@/lib/schemas/saison";
import { standInsertSchema } from "@/lib/schemas/stand";
import { standortInsertSchema } from "@/lib/schemas/standort";
import type { Database } from "@/lib/supabase/database.types";
import { createTestClient } from "@/lib/supabase/test";

type TableName = keyof Database["public"]["Tables"];

/** Kurze Zufalls-ID für kollisionsfreie Testdaten. */
export function uid(): string {
	return Math.random().toString(36).slice(2, 8);
}

/** Integrationstests laufen nur mit konfiguriertem Test-Supabase. */
export const hasSupabase = !!process.env.SUPABASE_TEST_URL;

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

// Stammdaten-CRUD-Instanzen, die praktisch jeder Integrationstest als
// Eltern-Datensätze braucht. Einmal hier definiert statt in jeder Datei.
const crudSaison = createTestCrud({
	table: "tb_saison",
	insertSchema: saisonInsertSchema,
	labels: { singular: "Saison", plural: "Saisons" },
	orderBy: { column: "start_datum" },
});
const crudStandort = createTestCrud({
	table: "tb_standort",
	insertSchema: standortInsertSchema,
	labels: { singular: "Standort", plural: "Standorte" },
});
const crudStand = createTestCrud({
	table: "tb_stand",
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
});
const crudProdukt = createTestCrud({
	table: "tb_produkt",
	insertSchema: produktInsertSchema,
	labels: { singular: "Produkt", plural: "Produkte" },
});
const crudKunde = createTestCrud({
	table: "tb_kunde",
	insertSchema: kundeInsertSchema,
	labels: { singular: "Kunde", plural: "Kunden" },
});

type Overrides = Partial<Record<string, unknown>>;

/**
 * Zentrale Fixture-Verwaltung für Integrationstests: legt Eltern-Datensätze an,
 * merkt sich alle erzeugten IDs und räumt in FK-sicherer Reihenfolge auf. Der
 * afterAll-Hook wird beim Aufruf automatisch registriert – der Test muss sich
 * also weder um Tracking noch um Cleanup kümmern.
 *
 * Reihenfolge des Cleanups (Kinder vor Eltern): erst die tabellenspezifischen
 * IDs des Tests selbst (via track()), dann Junction-Einträge, dann die hier
 * angelegten Stammdaten, zuletzt der geteilte Auth-Benutzer.
 */
export function createFixtures() {
	const tracked = new Map<TableName, string[]>();
	const junctions: Array<{ stand_id: string; saison_id: string }> = [];
	const authUserIds: string[] = [];

	let sharedProfilId: string | undefined;

	function remember(table: TableName, id: string) {
		const list = tracked.get(table) ?? [];
		list.push(id);
		tracked.set(table, list);
		return id;
	}

	/** Merkt sich eine ID zur Bereinigung (z. B. der eigentlich getesteten Tabelle). */
	function track(table: TableName, id: string): string {
		return remember(table, id);
	}

	async function createSaison(overrides: Overrides = {}) {
		const saison = await crudSaison.create({
			name: `test-${uid()}`,
			start_datum: "2026-01-01",
			end_datum: "2026-12-31",
			...overrides,
		});
		remember("tb_saison", saison.id);
		return saison;
	}

	async function createStandort(overrides: Overrides = {}) {
		const standort = await crudStandort.create({
			ort: `test-${uid()}`,
			plz: 1234,
			adresse: `${uid()}-Straße 1`,
			...overrides,
		});
		remember("tb_standort", standort.id);
		return standort;
	}

	async function createStand(overrides: Overrides = {}) {
		const standort = await createStandort();
		const stand = await crudStand.create({
			bezeichnung: `test-${uid()}`,
			standort_id: standort.id,
			...overrides,
		});
		remember("tb_stand", stand.id);
		return stand;
	}

	async function createProdukt(overrides: Overrides = {}) {
		const produkt = await crudProdukt.create({
			bezeichnung: `test-${uid()}`,
			art: "Baum",
			von_cm: 0,
			bis_cm: 100,
			...overrides,
		});
		remember("tb_produkt", produkt.id);
		return produkt;
	}

	async function createKunde(overrides: Overrides = {}) {
		const kunde = await crudKunde.create({
			name: `test-${uid()}`,
			telefon: `+49-${uid()}`,
			adresse: `${uid()}-Straße 1`,
			ist_firma: false,
			...overrides,
		});
		remember("tb_kunde", kunde.id);
		return kunde;
	}

	/**
	 * Liefert die ID eines pro Testdatei einmalig angelegten Auth-Profils
	 * (tb_profil mit passendem auth.users-Eintrag). Beim ersten Aufruf erzeugt.
	 */
	async function getProfilId(): Promise<string> {
		if (!sharedProfilId) {
			const profil = await createTestProfil();
			sharedProfilId = profil.id;
			authUserIds.push(profil.id);
		}
		return sharedProfilId;
	}

	/** Merkt sich einen Junction-Eintrag (tb_stand_saison) zur Bereinigung. */
	function trackJunction(standId: string, saisonId: string) {
		junctions.push({ stand_id: standId, saison_id: saisonId });
	}

	afterAll(async () => {
		if (!hasSupabase) return;
		const client = getClient();

		for (const { stand_id, saison_id } of junctions) {
			await client
				.from("tb_stand_saison")
				.delete()
				.eq("stand_id", stand_id)
				.eq("saison_id", saison_id);
		}

		// FK-sichere Reihenfolge: Kinder vor Eltern.
		const order: TableName[] = [
			"tb_position",
			"tb_wareneingangsposition",
			"tb_verkauf",
			"tb_wareneingang",
			"tb_reservierung",
			"tb_inventur",
			"tb_einsatz",
			"tb_preisempfehlung",
			"tb_kunde",
			"tb_produkt",
			"tb_stand",
			"tb_standort",
			"tb_saison",
		];
		for (const table of order) {
			const ids = tracked.get(table);
			if (ids && ids.length > 0) {
				await client.from(table).delete().in("id", ids);
			}
		}

		for (const id of authUserIds) {
			await deleteTestAuthUser(id);
		}
	});

	return {
		track,
		trackJunction,
		getProfilId,
		createSaison,
		createStandort,
		createStand,
		createProdukt,
		createKunde,
	};
}
