"use client";

import type { ReactElement } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { VerkaufMitDetails } from "@/lib/data/verkauf";
import { CrudDialog } from "../_crud/crud-dialog";
import { ReservierungAngaben } from "../_crud/reservierung-angaben";
import { datumFormat, euroFormat, offenerBetrag, StatusBadge } from "./format";

type VerkaufUebersichtDialogProps = {
	verkauf: VerkaufMitDetails;
	trigger: ReactElement;
};

/** Lese-Dialog mit allen Angaben zum Verkauf inkl. Positionen und Reservierung. */
export function VerkaufUebersichtDialog({
	verkauf,
	trigger,
}: VerkaufUebersichtDialogProps) {
	return (
		<CrudDialog
			trigger={trigger}
			className="sm:max-w-2xl"
			title={`Verkauf vom ${datumFormat.format(new Date(verkauf.verkauft_am))}`}
			description={`Alle Angaben inkl. Positionen${verkauf.reservierung ? " und Reservierung" : ""}.`}
		>
			{() => (
				<>
					<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
						<dt className="text-muted-foreground">Stand</dt>
						<dd>{verkauf.stand?.bezeichnung ?? "–"}</dd>
						<dt className="text-muted-foreground">Verkäufer</dt>
						<dd>{verkauf.verkaeufer?.name ?? "–"}</dd>
						<dt className="text-muted-foreground">Bezeichnung Aktion</dt>
						<dd>{verkauf.aktion_bz ?? "–"}</dd>
						<dt className="text-muted-foreground">Anmerkung</dt>
						<dd>{verkauf.anmerkung ?? "–"}</dd>
					</dl>

					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Produkt</TableHead>
									<TableHead className="text-right">Menge</TableHead>
									<TableHead className="text-right">Einzelpreis</TableHead>
									<TableHead className="text-right">Höhe</TableHead>
									<TableHead className="text-right">Summe</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{verkauf.positionen.map((position) => (
									<TableRow key={position.id}>
										<TableCell>
											{position.produkt
												? `${position.produkt.art} ${position.produkt.bezeichnung}`
												: "–"}
										</TableCell>
										<TableCell className="text-right">
											{position.menge}
										</TableCell>
										<TableCell className="text-right whitespace-nowrap">
											{euroFormat.format(position.einzelpreis)}
										</TableCell>
										<TableCell className="text-right whitespace-nowrap">
											{position.hoehe_cm} cm
										</TableCell>
										<TableCell className="text-right whitespace-nowrap">
											{euroFormat.format(position.menge * position.einzelpreis)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<p className="text-right text-sm">
						Gesamt:{" "}
						<span className="font-semibold">
							{euroFormat.format(verkauf.preis_gesamt)}
						</span>
					</p>

					{verkauf.reservierung && (
						<div className="flex flex-col gap-2 rounded-lg border p-3">
							<div className="flex items-center gap-2 text-sm font-medium">
								Reservierung
								<StatusBadge status={verkauf.reservierung.status} />
							</div>
							<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
								<ReservierungAngaben
									kunde={verkauf.reservierung.kunde}
									versandart={verkauf.reservierung.versandart}
									geplantesDatum={verkauf.reservierung.geplantes_datum}
									anzahlungsbetrag={verkauf.reservierung.anzahlungsbetrag}
									anmerkung={verkauf.reservierung.anmerkung}
								/>
								<dt className="text-muted-foreground">Offener Betrag</dt>
								<dd>
									{euroFormat.format(
										offenerBetrag(
											verkauf.preis_gesamt,
											verkauf.reservierung.anzahlungsbetrag,
										),
									)}
								</dd>
							</dl>
						</div>
					)}
				</>
			)}
		</CrudDialog>
	);
}
