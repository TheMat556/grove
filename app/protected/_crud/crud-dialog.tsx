"use client";

import {
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
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

type CrudDialogProps = {
	trigger: ReactElement;
	title: string;
	description: string;
	/** Breite des Dialogs (Default sm:max-w-md, z. B. sm:max-w-2xl für Übersichten). */
	className?: string;
	/** Inhalt oberhalb von Titel/Beschreibung (z. B. ein Stepper). */
	aboveTitle?: ReactNode;
	/** Meldet Öffnen/Schließen nach außen, z. B. um mehrstufige Inhalte zurückzusetzen. */
	onOpenChange?: (open: boolean) => void;
	/** Rendert den Formular-Inhalt; `close` schließt den Dialog nach Erfolg. */
	children: (close: () => void) => ReactNode;
};

/** Dialog um CRUD-Formulare; schließt, wenn das Formular Erfolg meldet. */
export function CrudDialog({
	trigger,
	title,
	description,
	className,
	aboveTitle,
	onOpenChange,
	children,
}: CrudDialogProps) {
	const [open, setOpen] = useState(false);
	// In einer Ref halten, damit `close` stabil bleibt und der Dialog nicht bei
	// jedem Parent-Render über den callback-identitätsgetriebenen Effekt zumacht.
	const onOpenChangeRef = useRef(onOpenChange);
	useEffect(() => {
		onOpenChangeRef.current = onOpenChange;
	});
	const changeOpen = useCallback((next: boolean) => {
		setOpen(next);
		onOpenChangeRef.current?.(next);
	}, []);
	const close = useCallback(() => changeOpen(false), [changeOpen]);

	return (
		<Dialog open={open} onOpenChange={changeOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className={className ?? "sm:max-w-md"}>
				{aboveTitle}
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children(close)}
			</DialogContent>
		</Dialog>
	);
}
