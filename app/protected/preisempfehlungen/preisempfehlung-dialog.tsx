"use client";

import type { ReactElement } from "react";
import type { Preisempfehlung } from "@/lib/schemas/preisempfehlung";
import { CrudDialog } from "../_crud/crud-dialog";
import { PreisempfehlungForm } from "./preisempfehlung-form";

type PreisempfehlungDialogProps = {
	mode: "create" | "edit";
	saisonId: string;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
	empfehlung?: Preisempfehlung;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten einer Preisempfehlung. */
export function PreisempfehlungDialog({
	mode,
	saisonId,
	produkte,
	empfehlung,
	trigger,
}: PreisempfehlungDialogProps) {
	return (
		<CrudDialog
			trigger={trigger}
			title={
				mode === "create"
					? "Preisempfehlung anlegen"
					: "Preisempfehlung bearbeiten"
			}
			description={
				mode === "create"
					? "Richtpreis für ein Produkt in der ausgewählten Saison festlegen."
					: "Preis oder Produkt der Empfehlung ändern."
			}
		>
			{(close) => (
				<PreisempfehlungForm
					mode={mode}
					saisonId={saisonId}
					produkte={produkte}
					empfehlung={empfehlung}
					onSuccess={close}
				/>
			)}
		</CrudDialog>
	);
}
