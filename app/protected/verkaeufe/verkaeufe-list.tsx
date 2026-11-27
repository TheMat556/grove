import { ArrowRight, Eye, Pencil } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getVerkaeufeMitDetails,
	type VerkaufMitDetails,
} from "@/lib/data/verkauf";
import { formatIsoDatum } from "@/lib/saison";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { ReservierungStatusToggle } from "../reservierungen/status-toggle";
import { deleteVerkaufAction } from "./actions";
import {
	datumFormat,
	euroFormat,
	offenerBetrag,
	StatusBadge,
	versandLabel,
} from "./format";
import { VerkaufDialog } from "./verkauf-dialog";
import { VerkaufUebersichtDialog } from "./verkauf-uebersicht-dialog";

function artikelText(positionen: VerkaufMitDetails["positionen"]) {
	return (
		positionen
			.map((p) =>
				`${p.menge} × ${p.produkt?.art ?? "?"} ${p.produkt?.bezeichnung ?? ""}`.trim(),
			)
			.join(", ") || "–"
	);
}

type VerkaeufeListProps = {
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
	preise: Record<string, number>;
	kunden: Array<{ id: string; name: string }>;
};

/** Verkäufe der gewählten Saison als Tabelle. */
export async function VerkaeufeList({
	saisonId,
	staende,
	produkte,
	preise,
	kunden,
}: VerkaeufeListProps) {
	const verkaeufe = await getVerkaeufeMitDetails(saisonId);

	if (verkaeufe.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Verkäufe in dieser Saison.
			</p>
		);
	}

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Datum</TableHead>
						<TableHead>Stand</TableHead>
						<TableHead>Artikel</TableHead>
						<TableHead className="text-right">Preis</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{verkaeufe.map((verkauf) => {
						const reservierung = verkauf.reservierung;
						const teile: ReactNode[] = [];
						if (reservierung) {
							teile.push(
								<span key="kunde">{reservierung.kunde?.name ?? "–"}</span>,
								<span key="versand">
									{versandLabel(reservierung.versandart)}
								</span>,
								<span key="datum">
									{formatIsoDatum(reservierung.geplantes_datum)}
								</span>,
								<StatusBadge key="status" status={reservierung.status} />,
							);
							if (reservierung.anzahlungsbetrag !== null) {
								teile.push(
									<span key="anzahlung">
										Anzahlung {euroFormat.format(reservierung.anzahlungsbetrag)}
									</span>,
								);
							}
							teile.push(
								<span key="offen" className="font-medium text-foreground">
									Offen{" "}
									{euroFormat.format(
										offenerBetrag(
											verkauf.preis_gesamt,
											reservierung.anzahlungsbetrag,
										),
									)}
								</span>,
							);
						}

						return (
							<Fragment key={verkauf.id}>
								<TableRow
									className={verkauf.reservierung ? "border-b-0" : undefined}
								>
									<TableCell className="whitespace-nowrap">
										{datumFormat.format(new Date(verkauf.verkauft_am))}
									</TableCell>
									<TableCell>{verkauf.stand?.bezeichnung ?? "–"}</TableCell>
									<TableCell className="max-w-64 truncate">
										{artikelText(verkauf.positionen)}
									</TableCell>
									<TableCell className="text-right whitespace-nowrap">
										{euroFormat.format(verkauf.preis_gesamt)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-2">
											<VerkaufUebersichtDialog
												verkauf={verkauf}
												trigger={
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Verkauf ansehen"
													>
														<Eye />
													</Button>
												}
											/>
											<VerkaufDialog
												saisonId={saisonId}
												staende={staende}
												produkte={produkte}
												preise={preise}
												kunden={kunden}
												verkauf={verkauf}
												trigger={
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Verkauf bearbeiten"
													>
														<Pencil />
													</Button>
												}
											/>
											<ConfirmDeleteForm
												action={deleteVerkaufAction}
												id={verkauf.id}
												entity="Verkauf"
											/>
										</div>
									</TableCell>
								</TableRow>

								{reservierung && (
									<TableRow>
										<TableCell colSpan={5} className="py-1.5">
											<div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-2 text-xs text-muted-foreground">
												<ArrowRight aria-hidden className="size-4 shrink-0" />
												<span className="font-medium text-foreground">
													Reservierung:
												</span>
												{teile.map((teil, index) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: feste Anzeigereihenfolge einer Reservierung, keine Umsortierung
													<Fragment key={index}>
														{index > 0 && <span aria-hidden>·</span>}
														{teil}
													</Fragment>
												))}
												<ReservierungStatusToggle
													id={reservierung.id}
													status={reservierung.status}
													size="icon-xs"
												/>
											</div>
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
