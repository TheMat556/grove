"use client";

import { useState } from "react";
import { kundeInsertSchema } from "@/lib/schemas/kunde";

/** Felder mit Live-Validierung (`ist_firma` hat keine Fehlermeldung). */
const FELDER = ["name", "telefon", "plz", "adresse"] as const;
export type KundenFeld = (typeof FELDER)[number];

/**
 * Live-Validierung im Kundenformular: Sobald ein Feld einmal geändert wurde,
 * wird es bei jedem Tippen sofort gegen sein Zod-Schema geprüft – ohne auf die
 * Server-Action zu warten. Vor dem ersten Tippen bleibt das Formular ruhig;
 * Feldfehler der Server-Action bleiben Fallback für unberührte Felder.
 */
export function useKundenFeldFehler(
	werte: Record<KundenFeld, string>,
	serverFehler?: Record<string, string[] | undefined>,
) {
	const [beruehrt, setBeruehrt] = useState<
		Partial<Record<KundenFeld, boolean>>
	>({});

	function markiereGeaendert(aenderung: Partial<Record<KundenFeld, unknown>>) {
		setBeruehrt((alt) => {
			let neu = alt;
			for (const feld of FELDER) {
				if (aenderung[feld] !== undefined && !neu[feld]) {
					neu = { ...neu, [feld]: true };
				}
			}
			return neu;
		});
	}

	const fehler: Record<string, string[]> = {};
	for (const feld of FELDER) {
		if (!beruehrt[feld]) {
			const serverMeldung = serverFehler?.[feld]?.[0];
			if (serverMeldung) fehler[feld] = [serverMeldung];
			continue;
		}
		const geprueft = kundeInsertSchema.shape[feld].safeParse(werte[feld]);
		if (!geprueft.success) {
			const meldung = geprueft.error.issues[0]?.message;
			if (meldung) fehler[feld] = [meldung];
		}
	}

	return { fehler, markiereGeaendert };
}
