import type { ReactNode } from "react";

type SaisonBereichProps = {
	titel: string;
	beschreibung: string;
	saisonName?: string;
	/** false, solange Saison, Stand/Produkt/Kunde für die Seite fehlen. */
	bereit: boolean;
	/** Hinweis, der bei !bereit statt der Liste steht. */
	hinweis: string;
	/** Anlegen-Dialog in der Kopfzeile (nur bei bereit gerendert). */
	aktion?: ReactNode;
	children: ReactNode;
};

/**
 * Gemeinsames Seitengerüst der Saison-Ansichten: Kopfzeile mit Saisonname,
 * Anlegen-Aktion und Hinweis-Gate. Die Seite liefert nur Daten, Aktion und Liste.
 */
export function SaisonBereich({
	titel,
	beschreibung,
	saisonName,
	bereit,
	hinweis,
	aktion,
	children,
}: SaisonBereichProps) {
	return (
		<div className="flex w-full flex-1 flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">{titel}</h1>
					<p className="text-sm text-muted-foreground">
						{beschreibung}
						{saisonName ? ` Ausgewählte Saison: ${saisonName}` : ""}
					</p>
				</div>
				{bereit && aktion}
			</div>

			{!bereit && <p className="text-sm text-muted-foreground">{hinweis}</p>}

			{children}
		</div>
	);
}
