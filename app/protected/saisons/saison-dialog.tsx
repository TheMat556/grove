"use client";

import { type ReactElement, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Saison } from "@/lib/schemas/saison";
import { SaisonForm } from "./saison-form";

type SaisonDialogProps = {
	mode: "create" | "edit";
	saison?: Saison;
	trigger: ReactElement;
};

export function SaisonDialog({ mode, saison, trigger }: SaisonDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create"
							? "Saison anlegen"
							: `Saison bearbeiten: ${saison?.name}`}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Neue Saison mit Zeitraum anlegen."
							: "Name oder Zeitraum ändern."}
					</DialogDescription>
				</DialogHeader>
				<SaisonForm
					mode={mode}
					saison={saison}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
