import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError, ZodObject, ZodType } from "zod";

/**
 * Gemeinsamer Zustandstyp aller CRUD-Formulare. Die Entity-actions.ts-Dateien
 * re-exportieren ihn unter ihrem eigenen Namen (z. B. StandortFormState),
 * damit die Formulare unverändert bleiben.
 */
export type EntityFormState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
};

type EntityActionsConfig<T> = {
	/**
	 * Refinement-freies ZodObject für create() und update() (siehe CrudConfig
	 * in lib/data/crud.ts).
	 */
	insertSchema: ZodObject;
	/**
	 * Optionales Schema für create() mit feldübergreifenden Regeln
	 * (z. B. produktCreateSchema). Ohne Angabe wird insertSchema verwendet.
	 */
	createSchema?: ZodType<T>;
	/**
	 * Optionales Schema für update(). Nötig bei feldübergreifenden Regeln, die
	 * auch beim Update greifen sollen (z. B. bis_cm >= von_cm bei Produkten).
	 * Ohne Angabe wird insertSchema verwendet.
	 */
	updateSchema?: ZodType<T>;
	/** FormData → Eingabeobjekt. Feld-Parsing bleibt entity-spezifisch. */
	mapInput: (formData: FormData) => unknown;
	create: (input: T) => Promise<unknown>;
	update: (id: string, input: Partial<T>) => Promise<unknown>;
	remove: (id: string) => Promise<void>;
	labels: { singular: string };
	revalidatePath: string;
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
 * Baut die drei mechanischen Server-Action-Bausteine für ein CRUD-Entity:
 * createAction, updateAction und deleteAction. Die Logik ist identisch mit
 * der bisherigen pro-Entity-Duplikation – nur der Unterschied (Schema(s),
 * Daten-Funktionen, FormData-Mapping, Labels, Pfad) kommt aus der Config.
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
	} = config;

	return {
		createAction: async (
			_prevState: EntityFormState,
			formData: FormData,
		): Promise<EntityFormState> => {
			const schema = createSchema ?? insertSchema;
			const parsed = schema.safeParse(mapInput(formData));

			if (!parsed.success) {
				return { errors: toFieldErrors(parsed.error) };
			}

			try {
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
			redirect(revalidatePathValue);
		},

		deleteAction: async (formData: FormData): Promise<void> => {
			const id = formData.get("id");
			if (typeof id !== "string" || !id) {
				return;
			}

			// ponytail: FK-Fehler beim Löschen landen vorerst in der Error-Boundary; Inline-Feedback erst bei echtem Nutzerbedarf
			await remove(id);
			revalidatePath(revalidatePathValue);
		},
	};
}
