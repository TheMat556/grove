import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getKunden } from "@/lib/data/kunde";
import { getStaende } from "@/lib/data/stand";
import { getVerkaeufeMitDetails } from "@/lib/data/verkauf";
import { formatIsoDatum } from "@/lib/saison";
import { getSaisonSelection } from "@/lib/saison-context";
import { SaisonBereich } from "../_crud/saison-bereich";
import { ReservierungDialog } from "./reservierung-dialog";
import { ReservierungenList } from "./reservierungen-list";

export default function ReservierungenPage() {
	// Cookie-Zugriff (Saisonwahl) muss unter Suspense liegen, sonst blockiert er
	// den Prerender der ganzen Route.
	return (
		<Suspense
			fallback={
				<p className="text-sm text-muted-foreground">Lade Reservierungen…</p>
			}
		>
			<ReservierungenInhalt />
		</Suspense>
	);
}

/** Reservierungen der gewählten Saison: Kopfzeile mit Anlegen-Dialog, darunter die Liste. */
async function ReservierungenInhalt() {
	const { saisons, selectedId } = await getSaisonSelection();
	const [staende, kunden, verkaeufe] = await Promise.all([
		getStaende(),
		getKunden(),
		selectedId ? getVerkaeufeMitDetails(selectedId) : Promise.resolve([]),
	]);
	const saisonName = saisons.find((saison) => saison.id === selectedId)?.name;
	const bereit = !!selectedId && staende.length > 0 && kunden.length > 0;
	// Nur eigenständige Verkäufe (ohne Reservierung) lassen sich verknüpfen.
	const verkaufsOptionen = verkaeufe
		.filter((verkauf) => !verkauf.reservierung_id)
		.map((verkauf) => ({
			id: verkauf.id,
			label: `${formatIsoDatum(verkauf.verkauft_am.slice(0, 10))} · ${verkauf.stand?.bezeichnung ?? "–"} · ${verkauf.verkaeufer?.name ?? "–"}`,
		}));

	return (
		<SaisonBereich
			titel="Reservierungen"
			beschreibung="Reservierungen mit Kunde, Stand und Termin."
			saisonName={saisonName}
			bereit={bereit}
			hinweis={
				selectedId
					? "Lege zuerst mindestens einen Stand und einen Kunden an."
					: "Lege zuerst eine Saison an."
			}
			aktion={
				selectedId ? (
					<ReservierungDialog
						mode="create"
						saisonId={selectedId}
						staende={staende}
						kunden={kunden}
						verkaeufe={verkaufsOptionen}
						trigger={
							<Button>
								<Plus />
								Reservierung anlegen
							</Button>
						}
					/>
				) : undefined
			}
		>
			{selectedId ? (
				<ReservierungenList
					saisonId={selectedId}
					staende={staende}
					kunden={kunden}
				/>
			) : null}
		</SaisonBereich>
	);
}
