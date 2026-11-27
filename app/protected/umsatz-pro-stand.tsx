"use client";

import { Store } from "lucide-react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	UMSATZ_ZEITRAEUME,
	type UmsatzVerkauf,
	type UmsatzZeitraum,
	umsatzProStand,
} from "@/lib/umsatz";
import { cn } from "@/lib/utils";
import { selectClasses } from "./_crud/select-classes";
import { euroFormat } from "./verkaeufe/format";

type UmsatzProStandCardProps = {
	/** Verkäufe der Saison; aggregiert wird bei jeder Filterwahl im Client. */
	verkaeufe: UmsatzVerkauf[];
};

/** Umsatz je Stand mit Zeitraum-Filter (Heute, 3 Tage, Woche, Saison). */
export function UmsatzProStandCard({ verkaeufe }: UmsatzProStandCardProps) {
	const [zeitraum, setZeitraum] = useState<UmsatzZeitraum>("woche");
	const zeilen = umsatzProStand(verkaeufe, zeitraum);
	const gesamt = zeilen.reduce((summe, zeile) => summe + zeile.umsatz, 0);
	const max = Math.max(...zeilen.map((zeile) => zeile.umsatz), 1);

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="flex flex-col gap-1">
						<CardTitle className="flex items-center gap-2">
							<Store className="size-4 text-emerald-600 dark:text-emerald-400" />
							Umsatz pro Stand
						</CardTitle>
						<CardDescription>
							{zeilen.length === 0
								? "Keine Verkäufe in diesem Zeitraum."
								: `Gesamt: ${euroFormat.format(gesamt)}`}
						</CardDescription>
					</div>
					<select
						aria-label="Zeitraum"
						value={zeitraum}
						onChange={(event) =>
							setZeitraum(event.target.value as UmsatzZeitraum)
						}
						className={cn(selectClasses, "w-auto")}
					>
						{UMSATZ_ZEITRAEUME.map((option) => (
							<option key={option.wert} value={option.wert}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</CardHeader>
			<CardContent>
				{zeilen.length === 0 ? null : (
					<ul className="flex flex-col gap-3">
						{zeilen.map((zeile) => (
							<li key={zeile.standId} className="flex flex-col gap-1">
								<div className="flex items-center justify-between gap-3">
									<span className="font-medium text-sm">{zeile.stand}</span>
									<span className="text-sm tabular-nums">
										{euroFormat.format(zeile.umsatz)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
											style={{ width: `${(zeile.umsatz / max) * 100}%` }}
										/>
									</div>
									<span className="text-xs text-muted-foreground tabular-nums">
										{zeile.anzahl === 1
											? "1 Verkauf"
											: `${zeile.anzahl} Verkäufe`}
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
