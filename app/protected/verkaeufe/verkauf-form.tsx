"use client";

import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberField } from "@/components/ui/number-field";
import { Textarea } from "@/components/ui/textarea";
import { preisGesamt } from "@/lib/schemas/verkauf";
import type { Tables } from "@/lib/supabase/database.types";
import { selectClasses } from "../_crud/select-classes";
import { useServerForm } from "../_crud/use-server-form";
import {
	createVerkaufAction,
	updateVerkaufAction,
	type VerkaufFormState,
} from "./actions";
import { euroFormat } from "./format";

const initialState: VerkaufFormState = {};

type Zeile = {
	key: string;
	produkt_id: string;
	menge: number | null;
	einzelpreis: number | null;
	hoehe_cm: number | null;
	kreuz_montiert: boolean;
};

function neueZeile(): Zeile {
	return {
		key: crypto.randomUUID(),
		produkt_id: "",
		menge: 1,
		einzelpreis: null,
		hoehe_cm: null,
		kreuz_montiert: false,
	};
}

export type VerkaufZumBearbeiten = Tables<"tb_verkauf"> & {
	positionen: Array<
		Pick<
			Tables<"tb_position">,
			"produkt_id" | "menge" | "einzelpreis" | "hoehe_cm" | "kreuz_montiert"
		>
	>;
	/** Verknüpfte Reservierung inkl. Kunde (für den Reservierungsschritt). */
	reservierung?:
		| (Tables<"tb_reservierung"> & { kunde: Tables<"tb_kunde"> | null })
		| null;
};

/** Bestehende Positionen als editierbare Zeilen; leere Verkäufe wie neu. */
function zeilenAusVerkauf(verkauf?: VerkaufZumBearbeiten): Zeile[] {
	if (!verkauf || verkauf.positionen.length === 0) return [neueZeile()];

	return verkauf.positionen.map((position) => ({
		key: crypto.randomUUID(),
		produkt_id: position.produkt_id,
		menge: position.menge,
		einzelpreis: position.einzelpreis,
		hoehe_cm: position.hoehe_cm,
		// Bestehende Kreuz-Montage bleibt beim Bearbeiten erhalten.
		kreuz_montiert: position.kreuz_montiert,
	}));
}

/** Felder je Position: [Name in Zeile, Label, min, step]. */
const FELDER = [
	["menge", "Menge", 1, 1],
	["einzelpreis", "Einzelpreis", 0, 0.01],
	["hoehe_cm", "Höhe (cm)", 0, 1],
] as const;

type VerkaufFormProps = {
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
	/** Preisempfehlung je produkt_id für die gewählte Saison. */
	preise: Record<string, number>;
	/** Nur im Bearbeiten-Modus: bestehender Verkauf inkl. Positionen. */
	verkauf?: VerkaufZumBearbeiten;
	/** Nach Erfolg: gespeicherter Verkauf für den optionalen Reservierungsschritt. */
	onSuccess?: (state: VerkaufFormState) => void;
};

/** Kopf und Positionen des Verkaufs; Anlegen oder Bearbeiten. */
export function VerkaufForm({
	saisonId,
	staende,
	produkte,
	preise,
	verkauf,
	onSuccess,
}: VerkaufFormProps) {
	const { state, isPending, formProps } = useServerForm(
		verkauf ? updateVerkaufAction : createVerkaufAction,
		initialState,
		(state) => onSuccess?.(state),
	);
	const [zeilen, setZeilen] = useState<Zeile[]>(() =>
		zeilenAusVerkauf(verkauf),
	);

	function aendern(key: string, werte: Partial<Zeile>) {
		setZeilen((alt) =>
			alt.map((zeile) => (zeile.key === key ? { ...zeile, ...werte } : zeile)),
		);
	}

	const positionen = zeilen.map((zeile) => ({
		produkt_id: zeile.produkt_id,
		// Leere Eingaben als 0; das Schema meldet sie als Feldfehler.
		menge: zeile.menge ?? 0,
		einzelpreis: zeile.einzelpreis ?? 0,
		kreuz_montiert: zeile.kreuz_montiert,
		hoehe_cm: zeile.hoehe_cm ?? 0,
	}));
	const summe = preisGesamt(positionen);

	return (
		<form {...formProps} className="flex flex-col gap-4">
			<input type="hidden" name="saison_id" value={saisonId} />
			{verkauf && <input type="hidden" name="id" defaultValue={verkauf.id} />}
			<input
				type="hidden"
				name="positionen"
				value={JSON.stringify(positionen)}
			/>

			<Field data-invalid={!!state.errors?.stand_id}>
				<FieldLabel htmlFor="verkauf-stand">Stand</FieldLabel>
				<select
					id="verkauf-stand"
					name="stand_id"
					className={selectClasses}
					defaultValue={verkauf?.stand_id ?? ""}
					aria-invalid={!!state.errors?.stand_id}
					required
				>
					<option value="" disabled>
						Bitte wählen…
					</option>
					{staende.map((stand) => (
						<option key={stand.id} value={stand.id}>
							{stand.bezeichnung}
						</option>
					))}
				</select>
				<FieldError>{state.errors?.stand_id?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.aktion_bz}>
				<FieldLabel htmlFor="verkauf-aktion">Bezeichnung Aktion</FieldLabel>
				<Input
					id="verkauf-aktion"
					name="aktion_bz"
					placeholder="optional"
					defaultValue={verkauf?.aktion_bz ?? ""}
					aria-invalid={!!state.errors?.aktion_bz}
				/>
				<FieldError>{state.errors?.aktion_bz?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.anmerkung}>
				<FieldLabel htmlFor="verkauf-anmerkung">Anmerkung</FieldLabel>
				<Textarea
					id="verkauf-anmerkung"
					name="anmerkung"
					rows={3}
					placeholder="optional"
					defaultValue={verkauf?.anmerkung ?? ""}
					aria-invalid={!!state.errors?.anmerkung}
				/>
				<FieldError>{state.errors?.anmerkung?.[0]}</FieldError>
			</Field>

			<div className="flex flex-col gap-2 rounded-lg border p-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Positionen</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setZeilen((alt) => [...alt, neueZeile()])}
					>
						<Plus />
						Position
					</Button>
				</div>

				{zeilen.map((zeile) => (
					<div
						key={zeile.key}
						className="flex flex-col gap-2 rounded-md border p-2"
					>
						<Field className="gap-1">
							<FieldLabel htmlFor={`produkt-${zeile.key}`}>Produkt</FieldLabel>
							<select
								id={`produkt-${zeile.key}`}
								className={selectClasses}
								value={zeile.produkt_id}
								onChange={(event) => {
									const produktId = event.target.value;
									// Preis folgt dem Produkt: Empfehlung übernehmen bzw. leeren.
									aendern(zeile.key, {
										produkt_id: produktId,
										einzelpreis: preise[produktId] ?? null,
									});
								}}
								required
							>
								<option value="" disabled>
									Produkt wählen…
								</option>
								{produkte.map((produkt) => (
									<option key={produkt.id} value={produkt.id}>
										{produkt.art} {produkt.bezeichnung}
										{preise[produkt.id] === undefined
											? ""
											: ` – ${euroFormat.format(preise[produkt.id])}`}
									</option>
								))}
							</select>
						</Field>

						<div className="grid gap-2 sm:grid-cols-3">
							{FELDER.map(([feld, label, min, step]) => (
								<Field className="gap-1" key={feld}>
									<FieldLabel htmlFor={`${feld}-${zeile.key}`}>
										{label}
									</FieldLabel>
									<NumberField
										id={`${feld}-${zeile.key}`}
										min={min}
										step={step}
										value={zeile[feld]}
										onValueChange={(wert) =>
											aendern(zeile.key, { [feld]: wert } as Partial<Zeile>)
										}
										required
									/>
								</Field>
							))}
						</div>

						<div className="flex justify-end">
							<Button
								type="button"
								variant="destructive"
								size="sm"
								aria-label="Position entfernen"
								disabled={zeilen.length === 1}
								onClick={() =>
									setZeilen((alt) =>
										alt.filter((vorhandene) => vorhandene.key !== zeile.key),
									)
								}
							>
								<Trash2 />
								Position entfernen
							</Button>
						</div>
					</div>
				))}

				<div className="flex items-center justify-between border-t pt-2">
					<FieldError>{state.errors?.positionen?.[0]}</FieldError>
					<p className="ml-auto text-sm">
						Gesamt:{" "}
						<span className="font-semibold">{euroFormat.format(summe)}</span>
					</p>
				</div>
			</div>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			<Button type="submit" disabled={isPending} className="self-end">
				{isPending ? "Speichern…" : "Weiter"}
				<ArrowRight className="size-3.5" aria-hidden />
			</Button>
		</form>
	);
}
