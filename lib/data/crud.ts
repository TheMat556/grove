import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { ZodObject, ZodType } from "zod";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type TableName = keyof Database["public"]["Tables"];
type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];

/**
 * Öffentliche API von createCrud(). getBySaisonId() wird per Conditional Type
 * NUR für Tabellen bereitgestellt, die tatsächlich eine saison_id-Spalte haben –
 * so ist ein Aufruf auf saison-fremden Tabellen bereits ein Compile-Fehler statt
 * eines Laufzeitfehlers.
 */
type CrudApi<T extends TableName> = {
	getAll: () => Promise<Row<T>[]>;
	getById: (id: string) => Promise<Row<T> | null>;
	create: (input: Insert<T>) => Promise<Row<T>>;
	update: (id: string, input: Partial<Insert<T>>) => Promise<Row<T>>;
	remove: (id: string) => Promise<void>;
} & ("saison_id" extends keyof Row<T>
	? { getBySaisonId: (saisonId: string) => Promise<Row<T>[]> }
	: Record<never, never>);

type ClientFactory = () => Promise<SupabaseClient>;

export type CrudConfig<T extends TableName> = {
	/** Tabellenname, z. B. "tb_saison". */
	table: T;
	/**
	 * Zod-Schema, das die Form eines Datensatzes beschreibt. Muss ein reines
	 * ZodObject ohne Refinements sein, damit für Teil-Updates .partial()
	 * abgeleitet werden kann. Feld- und feldübergreifende Regeln, die nur beim
	 * vollständigen Anlegen gelten, gehören in createSchema.
	 */
	insertSchema: ZodObject;
	/**
	 * Optionales Schema für create(). Hier dürfen .refine()/.superRefine()-Regeln
	 * liegen (z. B. "Enddatum >= Startdatum"), die bei Teil-Updates nicht greifen
	 * sollen. Ohne Angabe wird insertSchema verwendet.
	 */
	createSchema?: ZodType<Insert<T>>;
	/** Deutsche Labels für die Fehlermeldungen, z. B. { singular: "Saison", plural: "Saisons" }. */
	labels: { singular: string; plural: string };
	/** Optionale Standard-Sortierung für getAll(). */
	orderBy?: { column: keyof Row<T> & string; ascending?: boolean };
	/** Supabase-Client-Factory (default: @/lib/supabase/server createClient). */
	createClient?: ClientFactory;
};

/**
 * Erzeugt die fünf mechanischen CRUD-Operationen für eine flache Tabelle.
 *
 * Alles Relationale, Gefilterte oder Aggregierte gehört NICHT hierher, sondern
 * als eigene Funktion in das jeweilige Domänen-Modul (z. B. lib/data/produkt.ts).
 *
 * Hinweis zur Typisierung: Bei einem generischen Tabellennamen kann der
 * typisierte Supabase-Client die Zeilentypen nicht mehr auflösen (Union über
 * alle Tabellen). Deshalb wird der Client hier – und NUR hier – auf den
 * untypisierten Basis-Client gecastet; alle Aufrufer bleiben voll typisiert,
 * da Ein- und Rückgabetypen über die Generics erhalten bleiben.
 */
export function createCrud<T extends TableName>(config: CrudConfig<T>) {
	const { table, insertSchema, createSchema, labels, orderBy } = config;

	// Untypisierter Basis-Client – Escape-Hatch für den generischen Tabellennamen.
	const clientFactory = config.createClient ?? createClient;
	const client = async () =>
		(await clientFactory()) as unknown as SupabaseClient;

	const getAll = cache(async (): Promise<Row<T>[]> => {
		const supabase = await client();
		let query = supabase.from(table).select("*");
		if (orderBy) {
			query = query.order(orderBy.column, {
				ascending: orderBy.ascending ?? true,
			});
		}
		const { data, error } = await query;
		if (error) {
			throw new Error(
				`${labels.plural} konnten nicht geladen werden: ${error.message}`,
			);
		}
		return data as Row<T>[];
	});

	const getById = cache(async (id: string): Promise<Row<T> | null> => {
		const supabase = await client();
		const { data, error } = await supabase
			.from(table)
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (error) {
			throw new Error(
				`${labels.singular} konnte nicht geladen werden: ${error.message}`,
			);
		}
		return data as Row<T> | null;
	});

	const create = async (input: Insert<T>): Promise<Row<T>> => {
		const werte = (createSchema ?? insertSchema).parse(input);
		const supabase = await client();
		const { data, error } = await supabase
			.from(table)
			.insert(werte)
			.select()
			.single();
		if (error) {
			throw new Error(
				`${labels.singular} konnte nicht angelegt werden: ${error.message}`,
			);
		}
		return data as Row<T>;
	};

	const update = async (
		id: string,
		input: Partial<Insert<T>>,
	): Promise<Row<T>> => {
		// insertSchema ist per Vertrag ein refinement-freies ZodObject,
		// daher ist .partial() hier sicher.
		const werte = insertSchema.partial().parse(input);
		const supabase = await client();
		const { data, error } = await supabase
			.from(table)
			.update(werte)
			.eq("id", id)
			.select()
			.single();
		if (error) {
			throw new Error(
				`${labels.singular} konnte nicht aktualisiert werden: ${error.message}`,
			);
		}
		return data as Row<T>;
	};

	const remove = async (id: string): Promise<void> => {
		const supabase = await client();
		const { error } = await supabase.from(table).delete().eq("id", id);
		if (error) {
			throw new Error(
				`${labels.singular} konnte nicht gelöscht werden: ${error.message}`,
			);
		}
	};

	// Alle Datensätze einer Saison. Nur über CrudApi<T> sichtbar, wenn die
	// Tabelle eine saison_id-Spalte besitzt (siehe CrudApi).
	const getBySaisonId = cache(async (saisonId: string): Promise<Row<T>[]> => {
		const supabase = await client();
		let query = supabase.from(table).select("*").eq("saison_id", saisonId);
		if (orderBy) {
			query = query.order(orderBy.column, {
				ascending: orderBy.ascending ?? true,
			});
		}
		const { data, error } = await query;
		if (error) {
			throw new Error(
				`${labels.plural} konnten nicht geladen werden: ${error.message}`,
			);
		}
		return data as Row<T>[];
	});

	return {
		getAll,
		getById,
		create,
		update,
		remove,
		getBySaisonId,
	} as CrudApi<T>;
}
