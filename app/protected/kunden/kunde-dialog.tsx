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
import type { Kunde } from "@/lib/schemas/kunde";
import { KundeForm } from "./kunde-form";

type KundeDialogProps = {
	mode: "create" | "edit";
	kunde?: Kunde;
	trigger: ReactElement;
};

/** Dialog zum Anlegen oder Bearbeiten eines Kunden; schließt nach Erfolg. */
export function KundeDialog({ mode, kunde, trigger }: KundeDialogProps) {
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
							? "Kunde anlegen"
							: `Kunde bearbeiten: ${kunde?.name}`}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Neuen Kunden mit Kontaktdaten anlegen."
							: "Name, Kontaktdaten oder Kundentyp ändern."}
					</DialogDescription>
				</DialogHeader>
				<KundeForm mode={mode} kunde={kunde} onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
}
