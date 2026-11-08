import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError, ZodType } from "zod";
import { getCurrentProfilId } from "@/lib/data/session";

/**
 * Gemeinsamer Zustandstyp aller CRUD-Formulare. Die Entity-actions.ts-Dateien
 * re-exportieren ihn unter ihrem eigenen Namen (z. B. SaisonFormState),
 * damit die Formulare unverändert bleiben.
 */
export type EntityFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

type EntityActionsConfig<T> = {
	/**
	 * Schema des vollständigen Datensatzes (T wird daraus abgeleitet). Muss die
	 * Refinement-frei-Bedingung von CrudConfig erfüllen, sofern es auch an
	 * createCrud() geht.
	 */
	insertSchema: ZodType<T>;
	/**
	 * Optionales Schema für create() mit feldübergreifenden Regeln
	 * (z. B. produktCreateSchema). Ohne Angabe wird insertSchema verwendet.
	 */
	createSchema?: ZodType<T>;
	/**
	 * Optionales Schema für update(). Nötig bei feldübergreifenden Regeln, die
	 * auch beim Update greifen sollen (z. B. bis_cm >= von_cm bei Produkten),
	 * oder wenn nur ein Teil der Felder geschrieben wird (z. B. Profil).
	 * Ohne Angabe wird insertSchema verwendet.
	 */
	updateSchema?: ZodType<Partial<T>>;
	/** FormData → Eingabeobjekt. Feld-Parsing bleibt entity-spezifisch. */
	mapInput: (formData: FormData) => unknown;
	/**
	 * Optional: Entitäten ohne Create (z. B. Profil, tb_profil.id == auth.users.id)
	 * lassen create() weg und exportieren createAction nicht.
	 */
	create?: (input: T) => Promise<unknown>;
	update: (id: string, input: T) => Promise<unknown>;
	/**
	 * Optional: Entitäten ohne Delete (z. B. Profil) lassen remove() weg und
	 * exportieren deleteAction nicht.
	 */
	remove?: (id: string) => Promise<void>;
	labels: { singular: string };
	revalidatePath: string;
	/**
	 * Optionaler Pfad für FK-Fehler beim Löschen: Wenn gesetzt, landen Fehler
	 * (z. B. Referenz durch tb_position) als ?error=…-Banner auf der Liste;
	 * sonst in der Error-Boundary.
	 */
	removeErrorPath?: string;
	/**
	 * Standardmäßig leitet updateAction nach dem Speichern auf die Liste um.
	 * Mit false gibt die Action stattdessen { success: true } zurück, damit
	 * Dialog-Formulare sich schließen können.
	 */
	redirectOnUpdate?: boolean;
};

/**
 * flatten().fieldErrors ist je nach Schema-Typ als `{ [P in keyof T]?: string[] }`
 * oder `{ [x: string]: string[] | undefined }` typisiert; zur Laufzeit sind die
 * Werte immer ein Record aus string[]. Der Cast hält die generische Factory
 * typrein, ohne das Verhalten zu ändern.
 */
function toFieldErrors(error: ZodError): Record<string, string[]> {
	return error.flatten().fieldErrors as Record<string, string[]>;
}

/**
 * Baut die mechanischen Server-Action-Bausteine für ein CRUD-Entity:
 * createAction, updateAction und deleteAction. create() und remove() sind
 * optional – ohne sie wird der jeweilige Baustein nicht gebaut bzw. lehnt
 * mit einer Meldung ab. Die Logik ist identisch mit der bisherigen
 * pro-Entity-Duplikation – nur der Unterschied (Schema(s), Daten-Funktionen,
 * FormData-Mapping, Labels, Pfad) kommt aus der Config. Jede Action prüft die
 * Anmeldung selbst, zusätzlich zum Proxy.
 */
export function createEntityActions<T>(config: EntityActionsConfig<T>) {
	const {
		insertSchema,
		createSchema,
		updateSchema,
		mapInput,
		create,
		update,
		remove,
		labels,
		revalidatePath: revalidatePathValue,
		removeErrorPath,
		redirectOnUpdate,
	} = config;

	return {
		createAction: async (
			_prevState: EntityFormState,
			formData: FormData,
		): Promise<EntityFormState> => {
			if (!create) {
				return {
					message: `${labels.singular} kann nicht angelegt werden.`,
				};
			}

			const schema = createSchema ?? insertSchema;
			const parsed = schema.safeParse(mapInput(formData));

			if (!parsed.success) {
				return { errors: toFieldErrors(parsed.error) };
			}

			try {
				await getCurrentProfilId();
				await create(parsed.data as T);
			} catch (e) {
				return {
					message:
						e instanceof Error
							? e.message
							: `${labels.singular} konnte nicht angelegt werden.`,
				};
			}

			revalidatePath(revalidatePathValue);
			return { success: true };
		},

		updateAction: async (
			_prevState: EntityFormState,
			formData: FormData,
		): Promise<EntityFormState> => {
			const id = formData.get("id");
			if (typeof id !== "string" || !id) {
				return {
					message: `${labels.singular} konnte nicht aktualisiert werden.`,
				};
			}

			const parsed = (updateSchema ?? insertSchema).safeParse(
				mapInput(formData),
			);

			if (!parsed.success) {
				return { errors: toFieldErrors(parsed.error) };
			}

			try {
				await getCurrentProfilId();
				await update(id, parsed.data as T);
			} catch (e) {
				return {
					message:
						e instanceof Error
							? e.message
							: `${labels.singular} konnte nicht aktualisiert werden.`,
				};
			}

			revalidatePath(revalidatePathValue);
			if (redirectOnUpdate === false) {
				return { success: true };
			}
			redirect(revalidatePathValue);
		},

		deleteAction: async (formData: FormData): Promise<void> => {
			if (!remove) {
				return;
			}

			const id = formData.get("id");
			if (typeof id !== "string" || !id) {
				return;
			}

			// ponytail: ohne removeErrorPath landen FK-Fehler in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
			try {
				await getCurrentProfilId();
				await remove(id);
			} catch (e) {
				if (!removeErrorPath) throw e;
				const msg =
					e instanceof Error
						? e.message
						: `${labels.singular} konnte nicht gelöscht werden.`;
				redirect(`${removeErrorPath}?error=${encodeURIComponent(msg)}`);
			}

			revalidatePath(revalidatePathValue);
		},
	};
}
