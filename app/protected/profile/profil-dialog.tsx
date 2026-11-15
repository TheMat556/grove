"use client";

import {
	type ComponentProps,
	type ReactElement,
	useCallback,
	useState,
} from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ProfilForm } from "./profil-form";

type ProfilDialogProps = {
	mode: "create" | "edit";
	profil?: ComponentProps<typeof ProfilForm>["profil"];
	trigger: ReactElement;
};

/**
 * Dialog zum Anlegen oder Bearbeiten eines Profils.
 * Beim Bearbeiten schließt er sich nach Erfolg; beim Anlegen bleibt er offen,
 * damit das generierte Passwort zum Weitergeben sichtbar bleibt.
 */
export function ProfilDialog({ mode, profil, trigger }: ProfilDialogProps) {
	const [open, setOpen] = useState(false);
	const [speichert, setSpeichert] = useState(false);
	// Stabil halten: sonst re-triggert das Success-State des Formulars den Effect.
	const close = useCallback(() => setOpen(false), []);

	// Während des Speicherns nicht schließen: sonst ist das generierte Passwort
	// weg, obwohl das Konto serverseitig schon entsteht. Danach wieder normal.
	const handleOpenChange = (next: boolean) => {
		if (!next && speichert) return;
		setOpen(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create"
							? "Profil anlegen"
							: `Profil bearbeiten: ${profil?.name}`}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Neues Konto mit E-Mail und Passwort anlegen."
							: "Name, Telefon oder Aktiv-Status ändern."}
					</DialogDescription>
				</DialogHeader>
				<ProfilForm
					mode={mode}
					profil={profil}
					onSuccess={mode === "edit" ? close : undefined}
					onPendingChange={setSpeichert}
				/>
			</DialogContent>
		</Dialog>
	);
}
