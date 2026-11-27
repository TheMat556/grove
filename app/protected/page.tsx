import {
	CalendarCheck,
	CheckCircle2,
	Info,
	type LucideIcon,
	MapPin,
	Phone,
	Receipt,
	ShoppingBag,
	Truck,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getEinstellungen } from "@/lib/data/einstellungen";
import {
	getReservierungenMitDetails,
	type ReservierungMitDetails,
} from "@/lib/data/reservierung";
import { getStaende } from "@/lib/data/stand";
import { getVerkaeufeMitDetails } from "@/lib/data/verkauf";
import { googleMapsUrl } from "@/lib/maps";
import { formatIsoDatum, toIsoDate } from "@/lib/saison";
import { getSaisonSelection } from "@/lib/saison-context";
import {
	UMSATZ_ZEITRAEUME,
	type UmsatzZeitraum,
	umsatzProStand,
} from "@/lib/umsatz";
import { cn } from "@/lib/utils";
import { zaehlungenProTag } from "@/lib/verlauf";
import { DashboardStandFilter } from "./dashboard-stand-filter";
import { setzeReservierungStatusAction } from "./reservierungen/actions";
import { ReservierungUebersichtDialog } from "./reservierungen/reservierung-uebersicht-dialog";
import { UmsatzProStandCard } from "./umsatz-pro-stand";
import { euroFormat, kundeAdresse, versandLabel } from "./verkaeufe/format";

type DashboardSearchParams = Promise<{ stand?: string }>;

export default function ProtectedPage({
	searchParams,
}: {
	searchParams: DashboardSearchParams;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-bold text-2xl">Dashboard</h1>
				<Suspense fallback={<Skeleton className="h-8 w-40" />}>
					<StandFilter searchParams={searchParams} />
				</Suspense>
			</div>
			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Dashboard…</p>
				}
			>
				<Dashboard searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

/** Lädt die Stände für den Dashboard-Filter (Suspense wegen searchParams). */
async function StandFilter({
	searchParams,
}: {
	searchParams: DashboardSearchParams;
}) {
	const [params, staende] = await Promise.all([searchParams, getStaende()]);
	const selectedId = staende.find((stand) => stand.id === params.stand)?.id;

	return (
		<DashboardStandFilter
			staende={staende.map(({ id, bezeichnung }) => ({ id, bezeichnung }))}
			selectedId={selectedId}
		/>
	);
}

/** Überblick der gewählten Saison: Verkäufe, Reservierungen, fällige Lieferungen. */
async function Dashboard({
	searchParams,
}: {
	searchParams: DashboardSearchParams;
}) {
	const [params, { selectedId }] = await Promise.all([
		searchParams,
		getSaisonSelection(),
	]);

	if (!selectedId) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Saison angelegt –{" "}
				<Link href="/protected/saisons" className="underline">
					zuerst eine Saison anlegen
				</Link>
				.
			</p>
		);
	}

	const [reservierungen, verkaeufe, einstellungen, staende] = await Promise.all(
		[
			getReservierungenMitDetails(selectedId),
			getVerkaeufeMitDetails(selectedId),
			// Fehlende Einstellungen dürfen das Dashboard nicht blockieren.
			getEinstellungen().catch(() => null),
			getStaende(),
		],
	);

	// Stand-Filter aus dem allgemeinen Dashboard-Dropdown (ungültige IDs -> alle).
	const standId = staende.find((stand) => stand.id === params.stand)?.id;
	const sichtbareReservierungen = standId
		? reservierungen.filter((reservierung) => reservierung.stand_id === standId)
		: reservierungen;
	const sichtbareVerkaeufe = standId
		? verkaeufe.filter((verkauf) => verkauf.stand_id === standId)
		: verkaeufe;

	const heute = toIsoDate(new Date());
	const offeneReservierungen = sichtbareReservierungen.filter(
		(reservierung) => reservierung.status === "offen",
	);
	const faelligeReservierungen = offeneReservierungen
		.filter((reservierung) => reservierung.geplantes_datum <= heute)
		.sort((a, b) => a.geplantes_datum.localeCompare(b.geplantes_datum));
	const faelligeLieferungen = faelligeReservierungen.filter(
		(reservierung) => reservierung.versandart === "lieferung",
	);
	const faelligeAbholungen = faelligeReservierungen.filter(
		(reservierung) => reservierung.versandart === "abholung",
	);
	const anstehendeReservierungen = offeneReservierungen
		.filter((reservierung) => reservierung.geplantes_datum > heute)
		.sort((a, b) => a.geplantes_datum.localeCompare(b.geplantes_datum))
		.slice(0, 8);
	const verkaeufeHeute = sichtbareVerkaeufe.filter(
		(verkauf) => toIsoDate(new Date(verkauf.verkauft_am)) === heute,
	);
	const umsatzHeute = verkaeufeHeute.reduce(
		(summe, verkauf) => summe + verkauf.preis_gesamt,
		0,
	);
	// Kleine Verlaufsgraphen in den KPI-Kacheln: Ereignisse der letzten 14 Tage.
	const verkaufsSerie = zaehlungenProTag(
		sichtbareVerkaeufe.map((verkauf) => verkauf.verkauft_am),
		14,
	);
	const reservierungsSerie = zaehlungenProTag(
		sichtbareReservierungen.map((reservierung) => reservierung.reserviert_am),
		14,
	);
	const lieferungsSerie = zaehlungenProTag(
		faelligeLieferungen.map((lieferung) => lieferung.geplantes_datum),
		14,
	);

	// Umsatz je Stand für alle Filter-Zeiträume einmal serverseitig aggregieren.
	const umsatzVerkaufe = sichtbareVerkaeufe.map((verkauf) => ({
		stand_id: verkauf.stand_id,
		stand: verkauf.stand?.bezeichnung ?? "–",
		verkauft_am: verkauf.verkauft_am,
		preis_gesamt: verkauf.preis_gesamt,
	}));
	const umsatzDaten = Object.fromEntries(
		UMSATZ_ZEITRAEUME.map((zeitraum) => [
			zeitraum.wert,
			umsatzProStand(umsatzVerkaufe, zeitraum.wert),
		]),
	) as Record<UmsatzZeitraum, ReturnType<typeof umsatzProStand>>;

	const smsHinweis = !einstellungen
		? "SMS-Erinnerung noch nicht konfiguriert"
		: einstellungen.sms_aktiv
			? `SMS ${einstellungen.sms_vorlauf_tage} Tag(e) vor Lieferung um ${einstellungen.sms_uhrzeit.slice(0, 5)} Uhr`
			: "SMS-Erinnerung deaktiviert";

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<Kennzahl
					titel="Verkäufe heute"
					wert={verkaeufeHeute.length}
					hinweis={`Umsatz heute: ${euroFormat.format(umsatzHeute)}`}
					icon={Receipt}
					farbe="gruen"
					werte={verkaufsSerie}
				/>
				<Kennzahl
					titel="Offene Reservierungen"
					wert={offeneReservierungen.length}
					hinweis="in dieser Saison"
					icon={CalendarCheck}
					farbe="blau"
					werte={reservierungsSerie}
				/>
				<Kennzahl
					titel="Fällige Lieferungen"
					wert={faelligeLieferungen.length}
					hinweis={smsHinweis}
					icon={Truck}
					farbe={faelligeLieferungen.length > 0 ? "rot" : "amber"}
					werte={lieferungsSerie}
					warnung={faelligeLieferungen.length > 0}
				/>
			</div>

			<FaelligeReservierungen
				titel="Fällige Lieferungen"
				datumLabel="Lieferdatum"
				beschreibung="Offene Lieferungen, deren geplantes Datum erreicht oder überschritten ist."
				icon={Truck}
				iconClass="text-amber-600 dark:text-amber-400"
				reservierungen={faelligeLieferungen}
				heute={heute}
			/>

			<FaelligeReservierungen
				titel="Fällige Abholungen"
				datumLabel="Abholdatum"
				beschreibung="Offene Abholungen, deren geplantes Datum erreicht oder überschritten ist."
				icon={ShoppingBag}
				iconClass="text-sky-600 dark:text-sky-400"
				reservierungen={faelligeAbholungen}
				heute={heute}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarCheck className="size-4 text-sky-600 dark:text-sky-400" />
						Anstehende Reservierungen
					</CardTitle>
					<CardDescription>
						Offene Reservierungen mit einem Termin ab heute.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{anstehendeReservierungen.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Keine anstehenden Reservierungen.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Datum</TableHead>
									<TableHead>Kunde</TableHead>
									<TableHead>Stand</TableHead>
									<TableHead>Versand</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{anstehendeReservierungen.map((reservierung) => (
									<TableRow key={reservierung.id}>
										<TableCell className="whitespace-nowrap">
											{formatIsoDatum(reservierung.geplantes_datum)}
										</TableCell>
										<TableCell className="font-medium">
											{reservierung.kunde?.name ?? "–"}
										</TableCell>
										<TableCell>
											{reservierung.stand?.bezeichnung ?? "–"}
										</TableCell>
										<TableCell>
											{versandLabel(reservierung.versandart)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<UmsatzProStandCard daten={umsatzDaten} />
		</div>
	);
}

type KennzahlFarbe = "gruen" | "blau" | "amber" | "rot";

/** Farbtöne der KPI-Kacheln (Icon + Zahl), Flächen bleiben bewusst neutral. */
const kennzahlFarben: Record<
	KennzahlFarbe,
	{ icon: string; wert: string; spark: string }
> = {
	gruen: {
		icon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		wert: "text-emerald-700 dark:text-emerald-400",
		spark: "text-emerald-600 dark:text-emerald-400",
	},
	blau: {
		icon: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
		wert: "text-sky-700 dark:text-sky-400",
		spark: "text-sky-600 dark:text-sky-400",
	},
	amber: {
		icon: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		wert: "text-amber-700 dark:text-amber-400",
		spark: "text-amber-600 dark:text-amber-400",
	},
	rot: {
		icon: "bg-destructive/15 text-destructive",
		wert: "text-destructive",
		spark: "text-destructive",
	},
};

function Kennzahl({
	titel,
	wert,
	hinweis,
	icon: Icon,
	farbe,
	werte,
	warnung = false,
}: {
	titel: string;
	wert: number;
	hinweis: string;
	icon: LucideIcon;
	farbe: KennzahlFarbe;
	/** Tageswerte der letzten 14 Tage für den kleinen Graphen rechts. */
	werte: number[];
	warnung?: boolean;
}) {
	const farben = kennzahlFarben[farbe];

	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-start gap-3">
						<div
							className={cn(
								"grid size-10 shrink-0 place-items-center rounded-xl",
								farben.icon,
							)}
						>
							<Icon className="size-5" />
						</div>
						<div className="flex min-w-0 flex-col">
							<CardDescription>{titel}</CardDescription>
							<CardTitle
								className={cn(
									"font-bold text-3xl tabular-nums",
									warnung ? "text-destructive" : farben.wert,
								)}
							>
								{wert}
							</CardTitle>
						</div>
					</div>
					<Sparkline werte={werte} className={farben.spark} />
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-xs text-muted-foreground">{hinweis}</p>
			</CardContent>
		</Card>
	);
}

/** Kleiner Verlaufsgraph (letzte 14 Tage) in der Ecke einer KPI-Kachel. */
function Sparkline({
	werte,
	className,
}: {
	werte: number[];
	className?: string;
}) {
	if (werte.length < 2) return null;

	const breite = 80;
	const hoehe = 32;
	const rand = 3;
	const max = Math.max(...werte, 1);
	const x = (index: number) =>
		rand + (index / (werte.length - 1)) * (breite - rand * 2);
	const y = (wert: number) => hoehe - rand - (wert / max) * (hoehe - rand * 2);
	const letzter = werte[werte.length - 1] ?? 0;

	return (
		<svg
			viewBox={`0 0 ${breite} ${hoehe}`}
			className={cn("h-8 w-20 shrink-0", className)}
		>
			<title>Verlauf der letzten 14 Tage</title>
			<polyline
				points={werte.map((wert, index) => `${x(index)},${y(wert)}`).join(" ")}
				fill="none"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
				className="stroke-current"
			/>
			<circle
				cx={x(werte.length - 1)}
				cy={y(letzter)}
				r={2}
				className="fill-current"
			/>
		</svg>
	);
}

function TelefonLink({ telefon }: { telefon?: string | null }) {
	if (!telefon) return <span className="text-muted-foreground">–</span>;

	return (
		<a
			href={`tel:${telefon.replace(/\s/g, "")}`}
			className="inline-flex items-center gap-1 whitespace-nowrap hover:underline"
		>
			<Phone className="size-3.5" />
			{telefon}
		</a>
	);
}

/** Abschnitt für offene, fällige Lieferungen bzw. Abholungen derselben Saison. */
function FaelligeReservierungen({
	titel,
	datumLabel,
	beschreibung,
	icon: Icon,
	iconClass,
	reservierungen,
	heute,
}: {
	titel: string;
	datumLabel: string;
	beschreibung: string;
	icon: LucideIcon;
	iconClass: string;
	reservierungen: ReservierungMitDetails[];
	heute: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Icon className={cn("size-4", iconClass)} />
					{titel}
				</CardTitle>
				<CardDescription>{beschreibung}</CardDescription>
			</CardHeader>
			<CardContent>
				{reservierungen.length === 0 ? (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
						Alles erledigt – keine {titel.toLowerCase()}.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{datumLabel}</TableHead>
								<TableHead>Kunde &amp; Adresse</TableHead>
								<TableHead>Telefon</TableHead>
								<TableHead>Stand</TableHead>
								{/* Sticky: bleibt beim horizontalen Scrollen sichtbar. */}
								<TableHead className="sticky right-0 z-10 border-l border-border/60 bg-card text-right">
									Aktion
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reservierungen.map((reservierung) => (
								<TableRow key={reservierung.id}>
									<TableCell className="whitespace-nowrap">
										{formatIsoDatum(reservierung.geplantes_datum)}
										{reservierung.geplantes_datum < heute && (
											<Badge variant="destructive" className="ml-2">
												überfällig
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">
												{reservierung.kunde?.name ?? "–"}
											</span>
											<span className="text-xs text-muted-foreground">
												{kundeAdresse(reservierung.kunde)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<TelefonLink telefon={reservierung.kunde?.telefon} />
									</TableCell>
									<TableCell>
										{reservierung.stand?.bezeichnung ?? "–"}
									</TableCell>
									<TableCell className="sticky right-0 z-10 border-l border-border/60 bg-card text-right whitespace-nowrap">
										<div className="flex justify-end gap-2">
											<ReservierungUebersichtDialog
												reservierung={reservierung}
												trigger={
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Reservierung ansehen"
														title="Reservierung ansehen"
													>
														<Info />
													</Button>
												}
											/>
											<KarteButton kunde={reservierung.kunde} />
											<form action={setzeReservierungStatusAction}>
												<input
													type="hidden"
													name="id"
													value={reservierung.id}
												/>
												<input type="hidden" name="status" value="erfuellt" />
												<Button
													type="submit"
													variant="outline"
													size="sm"
													className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
												>
													<CheckCircle2 />
													Erledigt
												</Button>
											</form>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}

/** Google-Maps-Button für die Adresse des Kunden (ohne Adresse kein Button). */
function KarteButton({ kunde }: { kunde: ReservierungMitDetails["kunde"] }) {
	const karte = googleMapsUrl(kunde);
	if (!karte) return null;

	return (
		<a
			href={karte}
			target="_blank"
			rel="noreferrer"
			title="In Google Maps öffnen"
			aria-label="In Google Maps öffnen"
			className={cn(
				buttonVariants({ variant: "outline", size: "icon-sm" }),
				"text-sky-700 hover:text-sky-800 dark:text-sky-400",
			)}
		>
			<MapPin />
		</a>
	);
}
