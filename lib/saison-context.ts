import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSaisons } from "@/lib/data/saison";
import { defaultSaison, SAISON_COOKIE, type Saison } from "@/lib/saison";

type SaisonSelection = {
	saisons: Saison[];
	/** Saison-ID; fehlt, wenn es keine Saisons gibt. */
	selectedId?: string;
};

/**
 * Liest die Saison-Auswahl aus dem Cookie. Ohne (gültiges) Cookie wird die
 * laufende/letzte Saison gewählt. Pro Request memoisiert, damit Layout und
 * Seiten dieselbe Auswahl sehen.
 */
export const getSaisonSelection = cache(async (): Promise<SaisonSelection> => {
	const saisons = await getSaisons();
	const gewaehlt = (await cookies()).get(SAISON_COOKIE)?.value;

	if (gewaehlt && saisons.some((saison) => saison.id === gewaehlt)) {
		return { saisons, selectedId: gewaehlt };
	}

	return { saisons, selectedId: defaultSaison(saisons)?.id };
});
