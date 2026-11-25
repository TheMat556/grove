"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Kunde } from "@/lib/schemas/kunde";
import { useServerForm } from "../_crud/use-server-form";
import {
	createKundeAction,
	type KundeFormState,
	updateKundeAction,
} from "./actions";
import { KundeFelder, type KundeWerte } from "./kunde-felder";
import { useKundenFeldFehler } from "./use-kunden-feld-fehler";

const initialState: KundeFormState = {};

type KundeFormProps = {
	mode: "create" | "edit";
	kunde?: Kunde;
	onSuccess?: () => void;
};

/** Formular für einen Kunden; meldet Erfolg an den umgebenden Dialog. */
export function KundeForm({ mode, kunde, onSuccess }: KundeFormProps) {
	const { state, isPending, formProps } = useServerForm<KundeFormState>(
		mode === "create" ? createKundeAction : updateKundeAction,
		initialState,
		onSuccess,
	);
	const [werte, setWerte] = useState<KundeWerte>({
		name: kunde?.name ?? "",
		telefon: kunde?.telefon ?? "",
		plz: kunde?.plz ?? "",
		adresse: kunde?.adresse ?? "",
		ist_firma: kunde?.ist_firma ?? false,
	});
	const { fehler, markiereGeaendert } = useKundenFeldFehler(
		werte,
		state.errors,
	);

	return (
		<form {...formProps} className="flex flex-col gap-4">
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={kunde?.id} />
			)}

			<KundeFelder
				idPrefix={mode}
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

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending
					? "Speichern…"
					: mode === "create"
						? "Kunde anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
