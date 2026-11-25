import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getKunden } from "@/lib/data/kunde";
import { getPreisempfehlungenBySaisonId } from "@/lib/data/preisempfehlung";
import { getProdukte } from "@/lib/data/produkt";
import { getStaende } from "@/lib/data/stand";
import { getSaisonSelection } from "@/lib/saison-context";
import { SaisonBereich } from "../_crud/saison-bereich";
import { VerkaeufeList } from "./verkaeufe-list";
import { VerkaufDialog } from "./verkauf-dialog";

export default function VerkaeufePage() {
	// Cookie-Zugriff (Saisonwahl) muss unter Suspense liegen, sonst blockiert er
	// den Prerender der ganzen Route.
	return (
		<Suspense
			fallback={<p className="text-sm text-muted-foreground">Lade Verkäufe…</p>}
		>
			<VerkaeufeInhalt />
		</Suspense>
	);
}

/** Verkäufe der gewählten Saison: Kopfzeile mit Erfassen-Dialog, darunter die Liste. */
async function VerkaeufeInhalt() {
	const { saisons, selectedId } = await getSaisonSelection();
	const [staende, produkte, kunden, preisempfehlungen] = await Promise.all([
		getStaende(),
		getProdukte(),
		getKunden(),
		selectedId
			? getPreisempfehlungenBySaisonId(selectedId)
			: Promise.resolve([]),
	]);
	const preise = Object.fromEntries(
		preisempfehlungen.map((empfehlung) => [
			empfehlung.produkt_id,
			empfehlung.preis,
		]),
	);
	const saisonName = saisons.find((saison) => saison.id === selectedId)?.name;
	const bereit = !!selectedId && staende.length > 0 && produkte.length > 0;

	return (
		<SaisonBereich
			titel="Verkäufe"
			beschreibung="Verkäufe erfassen und einsehen."
			saisonName={saisonName}
			bereit={bereit}
			hinweis={
				selectedId
					? "Lege zuerst mindestens einen Stand und ein Produkt an."
					: "Lege zuerst eine Saison an."
			}
			aktion={
				selectedId ? (
					<VerkaufDialog
						saisonId={selectedId}
						staende={staende}
						produkte={produkte}
						preise={preise}
						kunden={kunden}
						trigger={
							<Button>
								<Plus />
								Verkauf erfassen
							</Button>
						}
					/>
				) : undefined
			}
		>
			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Verkäufe…</p>
				}
			>
				{selectedId ? (
					<VerkaeufeList
						saisonId={selectedId}
						staende={staende}
						produkte={produkte}
						preise={preise}
						kunden={kunden}
					/>
				) : null}
			</Suspense>
		</SaisonBereich>
	);
}
