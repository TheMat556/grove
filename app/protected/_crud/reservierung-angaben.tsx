import { googleMapsUrl } from "@/lib/maps";
import { formatIsoDatum } from "@/lib/saison";
import { euroFormat, kundeAdresse, versandLabel } from "../verkaeufe/format";

type ReservierungAngabenProps = {
	kunde: { name: string; plz: string; adresse: string } | null;
	versandart: string;
	geplantesDatum: string;
	anzahlungsbetrag: number | null;
	anmerkung: string | null;
};

/** Gemeinsame Reservierungszeilen der Übersichts-Dialoge (Verkauf und Reservierung). */
export function ReservierungAngaben({
	kunde,
	versandart,
	geplantesDatum,
	anzahlungsbetrag,
	anmerkung,
}: ReservierungAngabenProps) {
	return (
		<>
			<dt className="text-muted-foreground">Kunde</dt>
			<dd>{kunde?.name ?? "–"}</dd>
			<dt className="text-muted-foreground">Adresse</dt>
			<dd>
				{kunde?.adresse ? (
					<a
						href={googleMapsUrl(kunde)}
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-2"
					>
						{kundeAdresse(kunde)}
					</a>
				) : (
					kundeAdresse(kunde)
				)}
			</dd>
			<dt className="text-muted-foreground">Versandart</dt>
			<dd>{versandLabel(versandart)}</dd>
			<dt className="text-muted-foreground">Geplantes Datum</dt>
			<dd>{formatIsoDatum(geplantesDatum)}</dd>
			<dt className="text-muted-foreground">Anzahlung</dt>
			<dd>
				{anzahlungsbetrag === null ? "–" : euroFormat.format(anzahlungsbetrag)}
			</dd>
			<dt className="text-muted-foreground">Anmerkung</dt>
			<dd>{anmerkung || "–"}</dd>
		</>
	);
}
