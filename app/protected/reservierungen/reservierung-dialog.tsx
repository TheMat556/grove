"use client";

import type { ReactElement } from "react";
import type { Tables } from "@/lib/supabase/database.types";
import { CrudDialog } from "../_crud/crud-dialog";
import { ReservierungForm } from "./reservierung-form";

type ReservierungDialogProps = {
	mode: "create" | "edit";
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	kunden: Array<{ id: string; name: string }>;
	/** Nur create: eigenständige Verkäufe (ohne Reservierung) zum Verknüpfen. */
	verkaeufe?: Array<{ id: string; label: string }>;
	reservierung?: Tables<"tb_reservierung">;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten einer Reservierung. */
export function ReservierungDialog({
	mode,
	saisonId,
	staende,
	kunden,
	verkaeufe,
	reservierung,
	trigger,
}: ReservierungDialogProps) {
	return (
		<CrudDialog
			autoOpenNeu={mode === "create"}
			trigger={trigger}
			title={
				mode === "create"
					? "Reservierung anlegen"
					: `Reservierung bearbeiten: ${reservierung?.geplantes_datum}`
			}
			description={
				mode === "create"
					? "Kunde, Stand und Abhol- bzw. Liefertermin erfassen."
					: "Termin, Versandart, Anzahlung oder Status ändern."
			}
		>
			{(close) => (
				<ReservierungForm
					mode={mode}
					saisonId={saisonId}
					staende={staende}
					kunden={kunden}
					verkaeufe={verkaeufe}
					reservierung={reservierung}
					onSuccess={close}
				/>
			)}
		</CrudDialog>
	);
}
