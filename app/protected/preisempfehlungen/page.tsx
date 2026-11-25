import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getProdukte } from "@/lib/data/produkt";
import { getSaisonSelection } from "@/lib/saison-context";
import { SaisonBereich } from "../_crud/saison-bereich";
import { PreisempfehlungDialog } from "./preisempfehlung-dialog";
import { PreisempfehlungenList } from "./preisempfehlungen-list";

export default function PreisempfehlungenPage() {
	// Cookie-Zugriff (Saisonwahl) muss unter Suspense liegen, sonst blockiert er
	// den Prerender der ganzen Route.
	return (
		<Suspense
			fallback={
				<p className="text-sm text-muted-foreground">Lade Preisempfehlungen…</p>
			}
		>
			<PreisempfehlungenInhalt />
		</Suspense>
	);
}

/** Preisempfehlungen der gewählten Saison: Kopfzeile mit Anlegen-Dialog, darunter die Liste. */
async function PreisempfehlungenInhalt() {
	const { saisons, selectedId } = await getSaisonSelection();
	const produkte = await getProdukte();
	const saisonName = saisons.find((saison) => saison.id === selectedId)?.name;
	const bereit = !!selectedId && produkte.length > 0;

	return (
		<SaisonBereich
			titel="Preisempfehlungen"
			beschreibung="Richtpreise je Produkt, sichtbar im Verkauf-Dialog."
			saisonName={saisonName}
			bereit={bereit}
			hinweis={
				selectedId
					? "Lege zuerst mindestens ein Produkt an."
					: "Lege zuerst eine Saison an."
			}
			aktion={
				selectedId ? (
					<PreisempfehlungDialog
						mode="create"
						saisonId={selectedId}
						produkte={produkte}
						trigger={
							<Button>
								<Plus />
								Preisempfehlung anlegen
							</Button>
						}
					/>
				) : undefined
			}
		>
			{selectedId ? (
				<PreisempfehlungenList saisonId={selectedId} produkte={produkte} />
			) : null}
		</SaisonBereich>
	);
}
