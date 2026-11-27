import { Suspense } from "react";
import { getEinstellungen } from "@/lib/data/einstellungen";
import { EinstellungenForm } from "./einstellungen-form";

export default function EinstellungenPage() {
	return (
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl">Einstellungen</h1>
				<p className="text-sm text-muted-foreground">
					Globale Betriebseinstellungen. Die SMS-Erinnerung geht an die
					Telefonnummer des Kunden einer offenen Lieferung.
				</p>
			</div>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Einstellungen…</p>
				}
			>
				<EinstellungenInhalt />
			</Suspense>
		</div>
	);
}

async function EinstellungenInhalt() {
	const einstellungen = await getEinstellungen();

	return (
		<>
			<EinstellungenForm einstellungen={einstellungen} />
			<p className="text-sm text-muted-foreground">
				Hinweis: Der SMS-Versand selbst ist noch nicht angebunden (Provider
				folgt). Die Einstellungen legen jetzt schon fest, wann er ausgelöst
				wird.
			</p>
		</>
	);
}
