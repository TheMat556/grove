"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { NEU_DIALOG_EVENT } from "@/lib/neu-dialog";

/**
 * Link auf eine Anlegen-Seite (`?neu=1`). Zeigt er auf die aktuelle Seite,
 * wird nicht navigiert (der Dialog würde sonst nicht neu mounten), sondern
 * der bereits gerenderte Anlegen-Dialog per Event geöffnet.
 */
export function NeuLink({
	href,
	onClick,
	...props
}: ComponentProps<typeof Link>) {
	const pathname = usePathname();

	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		onClick?.(event);
		if (event.defaultPrevented) return;

		if (event.currentTarget.pathname !== pathname) return;

		event.preventDefault();
		window.dispatchEvent(new Event(NEU_DIALOG_EVENT));
	}

	return <Link href={href} onClick={handleClick} {...props} />;
}
