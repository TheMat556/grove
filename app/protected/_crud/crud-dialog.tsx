"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type CrudDialogProps = {
	trigger: ReactElement;
	title: string;
	description: string;
	/** Rendert den Formular-Inhalt; `close` schließt den Dialog nach Erfolg. */
	children: (close: () => void) => ReactNode;
};

/** Dialog um CRUD-Formulare; schließt, wenn das Formular Erfolg meldet. */
export function CrudDialog({
	trigger,
	title,
	description,
	children,
}: CrudDialogProps) {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children(close)}
			</DialogContent>
		</Dialog>
	);
}
