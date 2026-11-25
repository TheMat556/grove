"use client";

import { type ReactNode, useState } from "react";
import { DatePicker } from "@/components/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { NumberField } from "@/components/ui/number-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/lib/supabase/database.types";
import { useServerForm } from "../_crud/use-server-form";
import { createKundeAction, type KundeFormState } from "../kunden/actions";
import { KundeFelder, type KundeWerte } from "../kunden/kunde-felder";
import { KundenSelect } from "../kunden/kunden-select";
import { useKundenFeldFehler } from "../kunden/use-kunden-feld-fehler";
import {
	createReservierungAction,
	type ReservierungFormState,
	updateReservierungAction,
} from "./actions";

const initialState: ReservierungFormState = {};

const VERSAND_ITEMS = [
	{ value: "abholung", label: "Abholung" },
	{ value: "lieferung", label: "Lieferung" },
];

const STATUS_ITEMS = [
	{ value: "offen", label: "Offen" },
	{ value: "erfuellt", label: "Erfüllt" },
	{ value: "storniert", label: "Storniert" },
];

type ReservierungFormProps = {
	mode: "create" | "edit";
	saisonId: string;
	staende: Array<{ id: string; bezeichnung: string }>;
	kunden: Array<{ id: string; name: string }>;
	/** Nur create: eigenständige Verkäufe (ohne Reservierung) zum Verknüpfen. */
	verkaeufe?: Array<{ id: string; label: string }>;
	/** Nur create: Reservierung direkt mit diesem Verkauf verknüpfen. */
	verkaufId?: string;
	/** Fester Stand (z. B. aus dem Verkauf); blendet das Stand-Select aus. */
	standId?: string;
	reservierung?: Tables<"tb_reservierung">;
	onSuccess?: () => void;
	/** Zusätzliche Aktion neben dem Submit-Button (z. B. „Ohne Reservierung"). */
	additionalActions?: ReactNode;
};

export function ReservierungForm({
	mode,
	saisonId,
	staende,
	kunden,
	verkaeufe,
	verkaufId,
	standId,
	reservierung,
	onSuccess,
	additionalActions,
}: ReservierungFormProps) {
	const { state, isPending, formProps } = useServerForm(
		mode === "create" ? createReservierungAction : updateReservierungAction,
		initialState,
		onSuccess,
	);
	const [kundeId, setKundeId] = useState(reservierung?.kunde_id ?? "");
	// Inline angelegte Kunden sofort anbieten (RSC-Refresh erreicht diesen Dialog nicht).
	const [kundenLokal, setKundenLokal] = useState(kunden);
	const [panelOffen, setPanelOffen] = useState(false);

	const kundeFehler = panelOffen ? undefined : state.errors?.kunde_id?.[0];

	function kundeAngelegt(kunde: { id: string; name: string }) {
		setKundenLokal((alt) => [
			kunde,
			...alt.filter((vorhandener) => vorhandener.id !== kunde.id),
		]);
		setKundeId(kunde.id);
		setPanelOffen(false);
	}

	return (
		<form {...formProps} className="flex flex-col gap-4">
			<input type="hidden" name="saison_id" value={saisonId} />
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={reservierung?.id} />
			)}
			{mode === "create" && verkaufId && (
				<input type="hidden" name="verkauf_id" value={verkaufId} />
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					className={panelOffen ? "sm:col-span-2" : undefined}
					data-invalid={!!kundeFehler}
				>
					<FieldLabel htmlFor={`${mode}-reservierung-kunde`}>Kunde</FieldLabel>
					{panelOffen ? (
						// Aufdecken per wachsender Zeile statt per clip-path: die Maske
						// bräuchte volle Höhe und würde die Fläche darunter springen
						// lassen. Hier wächst die Zeile von 0fr auf 1fr, und das
						// clipping-Kind schneidet den Inhalt genau an dieser Kante ab.
						// min-h-0 ist Pflicht: overflow-clip allein setzt die automatische
						// Mindesthöhe des Grid-Items nicht auf 0.
						<div className="animate-aufdecken grid">
							<div className="min-h-0 overflow-clip">
								<NeuerKundeInline
									onCreated={kundeAngelegt}
									onAbbrechen={() => setPanelOffen(false)}
								/>
							</div>
						</div>
					) : (
						<KundenSelect
							id={`${mode}-reservierung-kunde`}
							kunden={kundenLokal}
							value={kundeId}
							onChange={setKundeId}
							onAnlegen={() => setPanelOffen(true)}
							invalid={!!kundeFehler}
						/>
					)}
					<FieldError>{kundeFehler}</FieldError>
				</Field>

				{mode === "create" && verkaeufe?.length ? (
					<Field>
						<FieldLabel htmlFor={`${mode}-reservierung-verkauf`}>
							Verkauf (optional)
						</FieldLabel>
						<Select
							name="verkauf_id"
							items={verkaeufe.map((verkauf) => ({
								value: verkauf.id,
								label: verkauf.label,
							}))}
						>
							<SelectTrigger
								id={`${mode}-reservierung-verkauf`}
								className="w-full"
							>
								<SelectValue placeholder="Ohne Verkauf" />
							</SelectTrigger>
							<SelectContent>
								{verkaeufe.map((verkauf) => (
									<SelectItem key={verkauf.id} value={verkauf.id}>
										{verkauf.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				) : null}

				{standId ? (
					<input type="hidden" name="stand_id" value={standId} />
				) : (
					<Field data-invalid={!!state.errors?.stand_id}>
						<FieldLabel htmlFor={`${mode}-reservierung-stand`}>
							Stand
						</FieldLabel>
						<Select
							name="stand_id"
							items={staende.map((stand) => ({
								value: stand.id,
								label: stand.bezeichnung,
							}))}
							defaultValue={reservierung?.stand_id}
							required
						>
							<SelectTrigger
								id={`${mode}-reservierung-stand`}
								className="w-full"
								aria-invalid={!!state.errors?.stand_id}
							>
								<SelectValue placeholder="Bitte wählen…" />
							</SelectTrigger>
							<SelectContent>
								{staende.map((stand) => (
									<SelectItem key={stand.id} value={stand.id}>
										{stand.bezeichnung}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldError>{state.errors?.stand_id?.[0]}</FieldError>
					</Field>
				)}

				<Field data-invalid={!!state.errors?.versandart}>
					<FieldLabel htmlFor={`${mode}-reservierung-versand`}>
						Versandart
					</FieldLabel>
					<Select
						name="versandart"
						items={VERSAND_ITEMS}
						defaultValue={reservierung?.versandart ?? "abholung"}
						required
					>
						<SelectTrigger
							id={`${mode}-reservierung-versand`}
							className="w-full"
							aria-invalid={!!state.errors?.versandart}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{VERSAND_ITEMS.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldError>{state.errors?.versandart?.[0]}</FieldError>
				</Field>

				<Field data-invalid={!!state.errors?.geplantes_datum}>
					<FieldLabel htmlFor={`${mode}-reservierung-datum`}>
						Geplantes Datum
					</FieldLabel>
					<DatePicker
						id={`${mode}-reservierung-datum`}
						name="geplantes_datum"
						defaultValue={reservierung?.geplantes_datum}
						invalid={!!state.errors?.geplantes_datum}
					/>
					<FieldError>{state.errors?.geplantes_datum?.[0]}</FieldError>
				</Field>

				<Field data-invalid={!!state.errors?.anzahlungsbetrag}>
					<FieldLabel htmlFor={`${mode}-reservierung-anzahlung`}>
						Anzahlung (€)
					</FieldLabel>
					<NumberField
						id={`${mode}-reservierung-anzahlung`}
						name="anzahlungsbetrag"
						placeholder="optional"
						min={0}
						step={0.01}
						invalid={!!state.errors?.anzahlungsbetrag}
						defaultValue={reservierung?.anzahlungsbetrag ?? undefined}
					/>
					<FieldError>{state.errors?.anzahlungsbetrag?.[0]}</FieldError>
				</Field>

				{mode === "edit" && (
					<Field data-invalid={!!state.errors?.status}>
						<FieldLabel htmlFor={`${mode}-reservierung-status`}>
							Status
						</FieldLabel>
						<Select
							name="status"
							items={STATUS_ITEMS}
							defaultValue={reservierung?.status ?? "offen"}
						>
							<SelectTrigger
								id={`${mode}-reservierung-status`}
								className="w-full"
								aria-invalid={!!state.errors?.status}
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{STATUS_ITEMS.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldError>{state.errors?.status?.[0]}</FieldError>
					</Field>
				)}
			</div>

			<Field data-invalid={!!state.errors?.anmerkung}>
				<FieldLabel htmlFor={`${mode}-reservierung-anmerkung`}>
					Anmerkung
				</FieldLabel>
				<Textarea
					id={`${mode}-reservierung-anmerkung`}
					name="anmerkung"
					rows={2}
					placeholder="optional"
					defaultValue={reservierung?.anmerkung ?? ""}
					aria-invalid={!!state.errors?.anmerkung}
				/>
				<FieldError>{state.errors?.anmerkung?.[0]}</FieldError>
			</Field>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			{additionalActions ? (
				<div className="flex flex-wrap items-center justify-end gap-2">
					{additionalActions}
					<Button type="submit" disabled={isPending}>
						{isPending
							? "Speichern…"
							: mode === "create"
								? "Reservierung anlegen"
								: "Änderungen speichern"}
					</Button>
				</div>
			) : (
				<Button type="submit" disabled={isPending} className="self-end">
					{isPending
						? "Speichern…"
						: mode === "create"
							? "Reservierung anlegen"
							: "Änderungen speichern"}
				</Button>
			)}
		</form>
	);
}

const LEERE_KUNDE: KundeWerte = {
	name: "",
	telefon: "",
	plz: "",
	adresse: "",
	ist_firma: false,
};

/**
 * Inline-Kundenanlage im selben Formular (kein verschachteltes <form>, weil
 * ungültiges HTML und der Submit sonst die Reservierung mit absenden würde).
 * Meldet den angelegten Kunden an das Select zurück.
 */
function NeuerKundeInline({
	onCreated,
	onAbbrechen,
}: {
	onCreated: (kunde: { id: string; name: string }) => void;
	onAbbrechen: () => void;
}) {
	const { state, isPending, submit } = useServerForm<KundeFormState>(
		createKundeAction,
		{},
		(next) => {
			if (next.kunde) onCreated(next.kunde);
		},
	);
	const [werte, setWerte] = useState<KundeWerte>(LEERE_KUNDE);
	const { fehler, markiereGeaendert } = useKundenFeldFehler(
		werte,
		state.errors,
	);

	function anlegen() {
		if (isPending) return;
		const daten = new FormData();
		daten.set("name", werte.name);
		daten.set("telefon", werte.telefon);
		daten.set("plz", werte.plz);
		daten.set("adresse", werte.adresse);
		if (werte.ist_firma) daten.set("ist_firma", "on");
		submit(daten);
	}

	return (
		<fieldset
			aria-label="Neuer Kunde"
			onKeyDown={(event) => {
				if (event.key !== "Escape") return;
				// Erst das Inline-Formular schließen – der Dialog bleibt offen.
				event.preventDefault();
				event.stopPropagation();
				onAbbrechen();
			}}
			className="flex flex-col gap-2 rounded-lg border p-3"
		>
			<p className="text-sm font-medium">Neuer Kunde</p>
			<KundeFelder
				idPrefix="neuer-kunde"
				werte={werte}
				fehler={fehler}
				onChange={(aenderung) => {
					markiereGeaendert(aenderung);
					setWerte((alt) => ({ ...alt, ...aenderung }));
				}}
			/>
			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onAbbrechen}>
					Abbrechen
				</Button>
				<Button type="button" disabled={isPending} onClick={anlegen}>
					{isPending ? "Anlegen…" : "Kunde anlegen"}
				</Button>
			</div>
		</fieldset>
	);
}
