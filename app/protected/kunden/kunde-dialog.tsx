"use client";

import type { ReactElement } from "react";
import type { Kunde } from "@/lib/schemas/kunde";
import { CrudDialog } from "../_crud/crud-dialog";
import { KundeForm } from "./kunde-form";

type KundeDialogProps = {
	mode: "create" | "edit";
	kunde?: Kunde;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten eines Kunden; schließt nach Erfolg. */
export function KundeDialog({ mode, kunde, trigger }: KundeDialogProps) {
	return (
		<CrudDialog
			autoOpenNeu={mode === "create"}
			trigger={trigger}
			title={mode === "create" ? "Kunde anlegen" : "Kunde bearbeiten"}
			description={
				mode === "create"
					? "Name, Kontaktdaten und Kundentyp erfassen."
					: "Name, Kontaktdaten oder Kundentyp ändern."
			}
		>
			{(close) => <KundeForm mode={mode} kunde={kunde} onSuccess={close} />}
		</CrudDialog>
	);
}
