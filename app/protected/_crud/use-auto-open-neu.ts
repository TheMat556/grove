"use client";

import { useEffect, useState } from "react";
import { NEU_DIALOG_EVENT } from "@/lib/neu-dialog";

/**
 * Dialog-Öffnungszustand für Anlegen-Dialoge: öffnet nach dem Mount, wenn die
 * Seite über das Plus-Menü mit `?neu=1` aufgerufen wurde oder das Menü das
 * Event auf der eigenen Seite feuert. Der Effekt (statt Initialwert) hält
 * Server-HTML und ersten Client-Render identisch.
 */
export function useAutoOpenNeu({ enabled = true }: { enabled?: boolean } = {}) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		if (new URLSearchParams(window.location.search).get("neu") === "1") {
			setOpen(true);
		}

		// Gleiche Seite: das Plus-Menü navigiert nicht, sondern feuert das Event.
		const oeffne = () => setOpen(true);
		window.addEventListener(NEU_DIALOG_EVENT, oeffne);
		return () => window.removeEventListener(NEU_DIALOG_EVENT, oeffne);
	}, [enabled]);

	return [open, setOpen] as const;
}
