import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getReservierungenMitDetails } from "@/lib/data/reservierung";
import { formatIsoDatum } from "@/lib/saison";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { euroFormat, StatusBadge, versandLabel } from "../verkaeufe/format";
import { deleteReservierungAction } from "./actions";
import { ReservierungDialog } from "./reservierung-dialog";
import { ReservierungUebersichtDialog } from "./reservierung-uebersicht-dialog";
import { ReservierungStatusToggle } from "./status-toggle";

type ReservierungenListProps = {
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	kunden: Array<{ id: string; name: string }>;
};

/** Reservierungen der gewählten Saison als Tabelle. */
export async function ReservierungenList({
	saisonId,
	staende,
	kunden,
}: ReservierungenListProps) {
	const reservierungen = await getReservierungenMitDetails(saisonId);

	if (reservierungen.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Reservierungen in dieser Saison.
			</p>
		);
	}

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Datum</TableHead>
						<TableHead>Kunde</TableHead>
						<TableHead>Stand</TableHead>
						<TableHead>Versand</TableHead>
						<TableHead className="text-right">Anzahlung</TableHead>
						<TableHead>Anmerkung</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservierungen.map((reservierung) => (
						<TableRow key={reservierung.id}>
							<TableCell className="whitespace-nowrap">
								{formatIsoDatum(reservierung.geplantes_datum)}
							</TableCell>
							<TableCell className="font-medium">
								{reservierung.kunde?.name ?? "–"}
							</TableCell>
							<TableCell>{reservierung.stand?.bezeichnung ?? "–"}</TableCell>
							<TableCell>{versandLabel(reservierung.versandart)}</TableCell>
							<TableCell className="text-right whitespace-nowrap">
								{reservierung.anzahlungsbetrag === null
									? "–"
									: euroFormat.format(reservierung.anzahlungsbetrag)}
							</TableCell>
							<TableCell className="max-w-40 truncate">
								{reservierung.anmerkung || "–"}
							</TableCell>
							<TableCell>
								<StatusBadge status={reservierung.status} />
							</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<ReservierungStatusToggle
										id={reservierung.id}
										status={reservierung.status}
									/>
									<ReservierungUebersichtDialog
										reservierung={reservierung}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Reservierung ansehen"
											>
												<Eye />
											</Button>
										}
									/>
									<ReservierungDialog
										mode="edit"
										saisonId={saisonId}
										staende={staende}
										kunden={kunden}
										reservierung={reservierung}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Reservierung bearbeiten"
											>
												<Pencil />
											</Button>
										}
									/>
									<ConfirmDeleteForm
										action={deleteReservierungAction}
										id={reservierung.id}
										entity="Reservierung"
									/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
