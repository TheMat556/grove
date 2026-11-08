"use client";

import { type ReactElement, useCallback, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ProduktForm, type ProduktFormValues } from "./produkt-form";

type ProduktDialogProps = {
	mode: "create" | "edit";
	produkt?: ProduktFormValues;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten eines Produkts; schließt nach Erfolg. */
export function ProduktDialog({ mode, produkt, trigger }: ProduktDialogProps) {
	const [open, setOpen] = useState(false);
	// Stabil halten: sonst re-triggert das Success-State des Formulars den Effect.
	const close = useCallback(() => setOpen(false), []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create"
							? "Produkt anlegen"
							: `Produkt bearbeiten: ${produkt?.bezeichnung}`}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Neues Produkt mit Art und Größe anlegen."
							: "Art, Bezeichnung oder Größe ändern."}
					</DialogDescription>
				</DialogHeader>
				<ProduktForm mode={mode} produkt={produkt} onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
}
