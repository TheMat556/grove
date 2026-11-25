import { Badge } from "@/components/ui/badge";

export const datumFormat = new Intl.DateTimeFormat("de-DE", {
	dateStyle: "short",
	timeStyle: "short",
	timeZone: "Europe/Berlin",
});

export const euroFormat = new Intl.NumberFormat("de-DE", {
	style: "currency",
	currency: "EUR",
});

const statusLabels = {
	offen: "Offen",
	erfuellt: "Erfüllt",
	storniert: "Storniert",
} as const;

export function versandLabel(versandart: string) {
	return versandart === "lieferung" ? "Lieferung" : "Abholung";
}

/** Offener Betrag: Gesamtpreis abzüglich Anzahlung (Intl rundet die Anzeige). */
export function offenerBetrag(gesamt: number, anzahlung: number | null) {
	return gesamt - (anzahlung ?? 0);
}

/** Einzeilige Kundenanschrift (PLZ + Adresse) für Übersichten. */
export function kundeAdresse(kunde: { plz: string; adresse: string } | null) {
	if (!kunde) return "–";
	return (
		[kunde.plz, kunde.adresse]
			.map((teil) => teil.trim())
			.filter(Boolean)
			.join(" ") || "–"
	);
}

/** Status-Badge der Reservierung – gleiche Farblogik in allen Ansichten. */
export function StatusBadge({ status }: { status: string }) {
	const variant =
		status === "erfuellt"
			? "default"
			: status === "storniert"
				? "destructive"
				: "secondary";
	return (
		<Badge variant={variant}>
			{statusLabels[status as keyof typeof statusLabels] ?? status}
		</Badge>
	);
}
