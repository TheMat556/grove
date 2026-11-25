"use client";

import type { ReactElement } from "react";
import type { Saison } from "@/lib/schemas/saison";
import { CrudDialog } from "../_crud/crud-dialog";
import { SaisonForm } from "./saison-form";

type SaisonDialogProps = {
	mode: "create" | "edit";
	saison?: Saison;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten einer Saison; schließt nach Erfolg. */
export function SaisonDialog({ mode, saison, trigger }: SaisonDialogProps) {
	return (
		<CrudDialog
			trigger={trigger}
			title={
				mode === "create"
					? "Saison anlegen"
					: `Saison bearbeiten: ${saison?.name}`
			}
			description={
				mode === "create"
					? "Neue Saison mit Zeitraum anlegen."
					: "Name oder Zeitraum ändern."
			}
		>
			{(close) => <SaisonForm mode={mode} saison={saison} onSuccess={close} />}
		</CrudDialog>
	);
}
