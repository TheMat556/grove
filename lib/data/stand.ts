import { createCrud } from "@/lib/data/crud";
import {
	createStandort,
	deleteStandort,
	getStandorte,
	updateStandort,
} from "@/lib/data/standort";
import {
	type Stand,
	type StandMitStandortInput,
	standInsertSchema,
} from "@/lib/schemas/stand";
import type { Standort } from "@/lib/schemas/standort";

const TABLE = "tb_stand";

const crud = createCrud({
	table: TABLE,
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
	orderBy: { column: "bezeichnung" },
});

export const getStaende = crud.getAll;
export const getStand = crud.getById;
export const createStand = crud.create;
export const updateStand = crud.update;
export const deleteStand = crud.remove;

export type StandMitStandort = Stand & { standort: Standort | null };

/** Liste für die UI: Stand-Datensatz inkl. des zugehörigen Standorts. */
export async function getStaendeMitStandort(): Promise<StandMitStandort[]> {
	const [staende, standorte] = await Promise.all([
		getStaende(),
		getStandorte(),
	]);
	const standortById = new Map(
		standorte.map((standort) => [standort.id, standort]),
	);

	return staende.map((stand) => ({
		...stand,
		standort: standortById.get(stand.standort_id) ?? null,
	}));
}

/**
 * Legt Stand + Standort gemeinsam an (UI fasst beides als "Stand" auf).
 * ponytail: keine DB-Transaktion – schlägt tb_stand fehl, wird der gerade
 * angelegte Standort wieder entfernt; RPC erst, wenn das Risiko real wird.
 */
export async function createStandMitStandort(input: StandMitStandortInput) {
	const standort = await createStandort({
		plz: input.plz,
		ort: input.ort,
		adresse: input.adresse,
	});

	try {
		return await createStand({
			standort_id: standort.id,
			bezeichnung: input.bezeichnung,
		});
	} catch (e) {
		await deleteStandort(standort.id).catch(() => {});
		throw e;
	}
}

/**
 * Ändert Stand und Standort gemeinsam. Der Standort wird über die aktuelle
 * standort_id des Stands ermittelt, damit das Formular sie nicht mitschleppen muss.
 * ponytail: teilen sich mehrere Stände einen Standort, ändert die Adresse beide.
 */
export async function updateStandMitStandort(
	id: string,
	input: StandMitStandortInput,
) {
	const stand = await getStand(id);
	if (!stand) throw new Error("Stand nicht gefunden.");

	await updateStandort(stand.standort_id, {
		plz: input.plz,
		ort: input.ort,
		adresse: input.adresse,
	});
	await updateStand(id, { bezeichnung: input.bezeichnung });
}

/** Löscht Stand + Standort; ein noch von anderen Ständen genutzter Standort bleibt. */
export async function deleteStandMitStandort(id: string) {
	const stand = await getStand(id);
	await deleteStand(id);
	if (!stand) return;
	await deleteStandort(stand.standort_id).catch(() => {});
}
