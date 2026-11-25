"use client";

import { Button } from "@/components/ui/button";

/** Fehlergrenze für alle Seiten unter /protected: Daten-Loader werfen, Next zeigt diese Seite. */
export default function ProtectedError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex flex-1 flex-col items-start gap-3">
			<h2 className="font-bold text-2xl">Etwas ist schiefgelaufen</h2>
			<p className="text-sm text-muted-foreground">
				{error.message || "Unbekannter Fehler"}
			</p>
			<Button onClick={reset}>Erneut versuchen</Button>
		</div>
	);
}
