import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSaisons } from "@/lib/data/saison";
import {
	defaultSaison,
	SAISON_ALL,
	SAISON_COOKIE,
	type Saison,
} from "@/lib/saison";

type SaisonSelection = {
	saisons: Saison[];
	/** Saison-ID oder SAISON_ALL. */
	selectedId: string;
};

/**
 * Liest die Saison-Auswahl aus dem Cookie. Ohne (gültiges) Cookie wird die
 * aktive/letzte Saison gewählt. Pro Request memoisiert, damit Layout und Seiten
 * dieselbe Auswahl sehen.
 */
const getSaisonSelectionCached = cache(async (): Promise<SaisonSelection> => {
	const saisons = await getSaisons();
	const gewaehlt = (await cookies()).get(SAISON_COOKIE)?.value;

	const selectedId =
		gewaehlt === SAISON_ALL
			? SAISON_ALL
			: gewaehlt && saisons.some((saison) => saison.id === gewaehlt)
				? gewaehlt
				: (defaultSaison(saisons)?.id ?? SAISON_ALL);

	return { saisons, selectedId };
});

/** Für den Header: Saison-Optionen plus aktuell gewählter Wert. */
export async function getSaisonSelection(): Promise<SaisonSelection> {
	return getSaisonSelectionCached();
}

/**
 * Saison-ID für Datenabfragen. null bedeutet "Alle Saisons" und wird von
 * saisonabhängigen Abfragen als "nicht filtern" interpretiert.
 */
export async function getSelectedSaisonId(): Promise<string | null> {
	const { selectedId } = await getSaisonSelectionCached();
	return selectedId === SAISON_ALL ? null : selectedId;
}
