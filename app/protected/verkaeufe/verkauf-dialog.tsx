"use client";

import { ArrowLeft } from "lucide-react";
import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CrudDialog } from "../_crud/crud-dialog";
import { ReservierungForm } from "../reservierungen/reservierung-form";
import type { VerkaufFormState } from "./actions";
import { VerkaufForm, type VerkaufZumBearbeiten } from "./verkauf-form";

type VerkaufDialogProps = {
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
	preise: Record<string, number>;
	kunden: Array<{ id: string; name: string }>;
	/** Gesetzt = Bearbeiten-Modus. */
	verkauf?: VerkaufZumBearbeiten;
	trigger: ReactElement;
};

type Schritt = "verkauf" | "reservierung";

const SCHRITTE = ["Verkauf", "Reservierung"] as const;

/**
 * Zweistufiger Dialog: Verkauf speichern („Weiter"), danach optional die
 * Reservierung erfassen/bearbeiten. „Zurück zum Verkauf" bearbeitet den gerade
 * gespeicherten Verkauf statt einen zweiten anzulegen.
 */
export function VerkaufDialog({
	saisonId,
	staende,
	produkte,
	preise,
	kunden,
	verkauf,
	trigger,
}: VerkaufDialogProps) {
	const [schritt, setSchritt] = useState<Schritt>("verkauf");
	// Nach dem Speichern gesetzt – Schritt 2 und „Zurück" arbeiten damit weiter.
	const [gespeichert, setGespeichert] = useState<NonNullable<
		VerkaufFormState["verkauf"]
	> | null>(null);
	const [positionen, setPositionen] =
		useState<VerkaufFormState["positionen"]>(undefined);

	const reservierung = verkauf?.reservierung ?? null;
	// Beim Bearbeiten (auch nach „Zurück") die gespeicherten Werte anzeigen.
	const bearbeitung: VerkaufZumBearbeiten | undefined =
		gespeichert && positionen ? { ...gespeichert, positionen } : verkauf;
	const imReservierungsschritt =
		schritt === "reservierung" && gespeichert !== null;

	function verkaufGespeichert(state: VerkaufFormState) {
		if (!state.verkauf) return;
		setGespeichert(state.verkauf);
		setPositionen(state.positionen);
		setSchritt("reservierung");
	}

	function zurueckZumVerkauf() {
		setSchritt("verkauf");
	}

	const stepper = (
		<ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
			{SCHRITTE.map((label, index) => {
				const aktuell = schritt === "verkauf" ? index === 0 : index === 1;
				return (
					<li className="flex items-center gap-2" key={label}>
						{index === 1 && <span aria-hidden className="h-px w-6 bg-border" />}
						<span
							aria-current={aktuell ? "step" : undefined}
							className={cn(
								"flex size-5 items-center justify-center rounded-full border text-[0.7rem]",
								aktuell
									? "border-primary bg-primary text-primary-foreground"
									: index === 0 && "border-primary text-primary",
							)}
						>
							{index + 1}
						</span>
						<span className={cn(aktuell && "font-medium text-foreground")}>
							{label}
						</span>
					</li>
				);
			})}
		</ol>
	);

	return (
		<CrudDialog
			aboveTitle={stepper}
			className="sm:max-w-xl"
			trigger={trigger}
			title={
				imReservierungsschritt
					? reservierung
						? "Reservierung bearbeiten"
						: "Reservierung anlegen"
					: bearbeitung
						? "Verkauf bearbeiten"
						: "Verkauf erfassen"
			}
			description={
				imReservierungsschritt
					? "Der Verkauf ist gespeichert. Optional Reservierung mit Kunde und Termin erfassen – sie wird mit dem Verkauf verknüpft."
					: bearbeitung
						? "Stand, Artikel, Preise oder Anmerkung ändern. Positionen werden ersetzt."
						: "Stand, Artikel und Preis erfassen. Der Gesamtpreis ergibt sich aus den Positionen."
			}
			// Beim Schließen (X, Escape, Backdrop) wieder bei Schritt 1 starten.
			onOpenChange={(open) => {
				if (open) return;
				setSchritt("verkauf");
				setGespeichert(null);
				setPositionen(undefined);
			}}
		>
			{(close) =>
				imReservierungsschritt && gespeichert ? (
					<ReservierungForm
						mode={reservierung ? "edit" : "create"}
						saisonId={saisonId}
						staende={staende}
						kunden={kunden}
						verkaufId={reservierung ? undefined : gespeichert.id}
						standId={reservierung ? undefined : gespeichert.stand_id}
						reservierung={reservierung ?? undefined}
						onSuccess={close}
						additionalActions={
							<>
								<Button
									type="button"
									variant="outline"
									className="mr-auto"
									onClick={zurueckZumVerkauf}
								>
									<ArrowLeft />
									Zurück zum Verkauf
								</Button>
								<Button
									type="button"
									variant="outline"
									// Verkauf ohne Reservierung abschließen ist vorerst nicht vorgesehen.
									disabled={!reservierung}
									onClick={close}
								>
									{reservierung ? "Schließen" : "Ohne Reservierung"}
								</Button>
							</>
						}
					/>
				) : (
					<VerkaufForm
						saisonId={saisonId}
						staende={staende}
						produkte={produkte}
						preise={preise}
						verkauf={bearbeitung}
						onSuccess={verkaufGespeichert}
					/>
				)
			}
		</CrudDialog>
	);
}
