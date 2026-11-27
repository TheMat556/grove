import "server-only";
import { toIsoDate } from "@/lib/saison";
import type { EinstellungenUpdate } from "@/lib/schemas/einstellungen";

/** Reservierungsfelder, die für die SMS-Fälligkeit entscheidend sind. */
type SmsKandidat = {
	versandart: string;
	status: string;
	geplantes_datum: string;
	kunde: { telefon: string } | null;
};

const berlinTimeFormat = new Intl.DateTimeFormat("sv-SE", {
	timeZone: "Europe/Berlin",
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
});

/** Datum, an dem die SMS fällig wird: Lieferdatum minus Vorlaufzeit. */
export function smsTerminDatum(
	geplantesDatum: string,
	vorlaufTage: number,
): string {
	const termin = new Date(`${geplantesDatum.slice(0, 10)}T00:00:00Z`);
	termin.setUTCDate(termin.getUTCDate() - vorlaufTage);
	return termin.toISOString().slice(0, 10);
}

/**
 * True, sobald die SMS für diese Lieferung rausgehen soll: offen, Versandart
 * Lieferung, Kunde mit Telefonnummer, SMS aktiv und der Termin (Lieferdatum
 * minus Vorlaufzeit, um die eingestellte Uhrzeit) erreicht.
 */
export function istSmsFaellig(
	reservierung: SmsKandidat,
	einstellungen: EinstellungenUpdate,
	now = new Date(),
): boolean {
	if (!einstellungen.sms_aktiv) return false;
	if (reservierung.status !== "offen") return false;
	if (reservierung.versandart !== "lieferung") return false;
	if (!reservierung.kunde?.telefon.trim()) return false;

	const termin = smsTerminDatum(
		reservierung.geplantes_datum,
		einstellungen.sms_vorlauf_tage,
	);
	// DB-Time liefert "08:00:00", das Formular "08:00" – verglichen wird HH:MM.
	const jetztDatum = toIsoDate(now);
	const jetztUhrzeit = berlinTimeFormat.format(now);
	const uhrzeit = einstellungen.sms_uhrzeit.slice(0, 5);

	// Datum als String-Vergleich (yyyy-mm-dd); erst am Termintag zählt die Uhrzeit.
	return (
		jetztDatum > termin || (jetztDatum === termin && jetztUhrzeit >= uhrzeit)
	);
}
