import "server-only";
import { getEinstellungen } from "@/lib/data/einstellungen";
import {
	getReservierungenMitDetails,
	type ReservierungMitDetails,
} from "@/lib/data/reservierung";
import { googleMapsUrl } from "@/lib/maps";
import { formatIsoDatum, toIsoDate } from "@/lib/saison";

/** Felder der globalen Einstellungen, die den SMS-Termin bestimmen. */
export type SmsEinstellungen = {
	sms_aktiv: boolean;
	sms_vorlauf_tage: number;
	sms_uhrzeit: string;
};

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

/** Aktuelles Datum/Uhrzeit in der Zeitzone des Betriebs (ohne Date-TZ-Raten). */
function jetztInBerlin(now: Date) {
	return { datum: toIsoDate(now), uhrzeit: berlinTimeFormat.format(now) };
}

/** DB-Time liefert "08:00:00", das Formular "08:00" – verglichen wird HH:MM. */
function normiereUhrzeit(uhrzeit: string) {
	return uhrzeit.slice(0, 5);
}

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
	einstellungen: SmsEinstellungen,
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
	const jetzt = jetztInBerlin(now);
	const uhrzeit = normiereUhrzeit(einstellungen.sms_uhrzeit);

	// Datum als String-Vergleich (yyyy-mm-dd); erst am Termintag zählt die Uhrzeit.
	return (
		jetzt.datum > termin || (jetzt.datum === termin && jetzt.uhrzeit >= uhrzeit)
	);
}

/** Offene Lieferungen der Saison, deren SMS-Termin erreicht ist. */
export async function getFaelligeLieferSms(
	saisonId: string,
	now = new Date(),
): Promise<ReservierungMitDetails[]> {
	const [reservierungen, einstellungen] = await Promise.all([
		getReservierungenMitDetails(saisonId),
		getEinstellungen(),
	]);

	return reservierungen.filter((reservierung) =>
		istSmsFaellig(reservierung, einstellungen, now),
	);
}

/** Einziger Provider-Punkt. Kommt in einem späteren Schritt (z. B. Twilio). */
async function sendeSms(_nachricht: {
	an: string;
	text: string;
}): Promise<void> {
	// Bewusst laut statt still: ein "erfolgreicher" Versand ohne Provider wäre eine Lüge.
	throw new Error("SMS-Versand ist noch nicht eingerichtet.");
}

/** Kurztext mit Lieferadresse und Karten-Link für die SMS. */
export function smsText(reservierung: ReservierungMitDetails): string {
	const standort = reservierung.stand?.standort ?? null;
	const adresse = standort
		? `${standort.adresse}, ${standort.plz} ${standort.ort}`
		: (reservierung.stand?.bezeichnung ?? "Stand");
	const karte = googleMapsUrl(standort);
	const ziel = karte ? `${adresse} – ${karte}` : adresse;

	return `Lieferung am ${formatIsoDatum(reservierung.geplantes_datum)}: ${ziel}`;
}

export type SmsVersandErgebnis = {
	reservierungId: string;
	gesendet: boolean;
	fehler?: string;
};

/**
 * Verschickt alle fälligen Liefer-SMS der Saison. Aufrufer ist später ein Cron
 * bzw. Route Handler; bis dahin ist der Versand ein Fehler pro Reservierung.
 *
 * ponytail: kein "SMS gesendet"-Status in der DB – ein zweiter Lauf schickt
 * dieselbe SMS erneut. Spalte sms_gesendet_am ergänzen, sobald ein Provider
 * angebunden ist und der Doppelversand real wird.
 */
export async function sendeFaelligeLieferSms(
	saisonId: string,
	now = new Date(),
): Promise<SmsVersandErgebnis[]> {
	const faellige = await getFaelligeLieferSms(saisonId, now);
	const ergebnisse: SmsVersandErgebnis[] = [];

	for (const reservierung of faellige) {
		const telefon = reservierung.kunde?.telefon;
		if (!telefon) continue;

		try {
			await sendeSms({ an: telefon, text: smsText(reservierung) });
			ergebnisse.push({ reservierungId: reservierung.id, gesendet: true });
		} catch (e) {
			ergebnisse.push({
				reservierungId: reservierung.id,
				gesendet: false,
				fehler: e instanceof Error ? e.message : "Unbekannter Fehler.",
			});
		}
	}

	return ergebnisse;
}
