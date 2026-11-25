"use client";

import type { ReactElement } from "react";
import type { ReservierungMitDetails } from "@/lib/data/reservierung";
import { formatIsoDatum } from "@/lib/saison";
import { CrudDialog } from "../_crud/crud-dialog";
import { ReservierungAngaben } from "../_crud/reservierung-angaben";
import { datumFormat, StatusBadge } from "../verkaeufe/format";

type ReservierungUebersichtDialogProps = {
	reservierung: ReservierungMitDetails;
	trigger: ReactElement;
};

/** Übersicht zur Reservierung mit gemeinsamen Angaben und Reservierungs-Only-Feldern. */
export function ReservierungUebersichtDialog({
	reservierung,
	trigger,
}: ReservierungUebersichtDialogProps) {
	return (
		<CrudDialog
			trigger={trigger}
			title={`Reservierung: ${reservierung.kunde?.name ?? "–"}`}
			description={`Geplant für ${formatIsoDatum(reservierung.geplantes_datum)}.`}
		>
			{() => (
				<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
					<ReservierungAngaben
						kunde={reservierung.kunde}
						versandart={reservierung.versandart}
						geplantesDatum={reservierung.geplantes_datum}
						anzahlungsbetrag={reservierung.anzahlungsbetrag}
						anmerkung={reservierung.anmerkung}
					/>
					<dt className="text-muted-foreground">Telefon</dt>
					<dd>{reservierung.kunde?.telefon || "–"}</dd>
					<dt className="text-muted-foreground">Stand</dt>
					<dd>{reservierung.stand?.bezeichnung ?? "–"}</dd>
					<dt className="text-muted-foreground">Status</dt>
					<dd>
						<StatusBadge status={reservierung.status} />
					</dd>
					<dt className="text-muted-foreground">Reserviert am</dt>
					<dd>{datumFormat.format(new Date(reservierung.reserviert_am))}</dd>
				</dl>
			)}
		</CrudDialog>
	);
}
