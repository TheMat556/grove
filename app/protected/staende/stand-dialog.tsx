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
import type { StandMitStandort } from "@/lib/data/stand";
import { StandForm } from "./stand-form";

type StandDialogProps = {
	mode: "create" | "edit";
	stand?: StandMitStandort;
	trigger: ReactElement;
};

export function StandDialog({ mode, stand, trigger }: StandDialogProps) {
	const [open, setOpen] = useState(false);
	// Stabil halten: sonst re-triggert die Success-State-Änderung im Formular bei
	// jedem Render und schließt den Dialog direkt nach dem Wiederöffnen.
	const close = useCallback(() => setOpen(false), []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create"
							? "Stand anlegen"
							: `Stand bearbeiten: ${stand?.bezeichnung}`}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Neuen Stand mit Bezeichnung und Standort anlegen."
							: "Bezeichnung oder Standort ändern."}
					</DialogDescription>
				</DialogHeader>
				<StandForm mode={mode} stand={stand} onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
}
