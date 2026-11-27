"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerForm } from "../_crud/use-server-form";
import {
	type EinstellungenFormState,
	updateEinstellungenAction,
} from "./actions";

type EinstellungenFormProps = {
	einstellungen: {
		sms_aktiv: boolean;
		sms_vorlauf_tage: number;
		sms_uhrzeit: string;
	};
};

const initialState: EinstellungenFormState = {};

/** Formular für die globalen Einstellungen; Fehler kommen aus der Server-Action. */
export function EinstellungenForm({ einstellungen }: EinstellungenFormProps) {
	const { state, isPending, formProps } = useServerForm(
		updateEinstellungenAction,
		initialState,
	);

	return (
		<form {...formProps} className="flex max-w-md flex-col gap-4">
			<div className="flex items-center gap-2">
				<Checkbox
					id="sms_aktiv"
					name="sms_aktiv"
					defaultChecked={einstellungen.sms_aktiv}
				/>
				<Label htmlFor="sms_aktiv">SMS-Erinnerung für Lieferungen aktiv</Label>
			</div>

			<Field data-invalid={!!state.errors?.sms_vorlauf_tage}>
				<FieldLabel htmlFor="sms_vorlauf_tage">Vorlaufzeit in Tagen</FieldLabel>
				<Input
					id="sms_vorlauf_tage"
					name="sms_vorlauf_tage"
					type="number"
					min={0}
					max={30}
					defaultValue={einstellungen.sms_vorlauf_tage}
					aria-invalid={!!state.errors?.sms_vorlauf_tage}
				/>
				<FieldDescription>
					Wie viele Tage vor dem geplanten Lieferdatum die SMS rausgeht (0 = am
					Liefertag).
				</FieldDescription>
				<FieldError>{state.errors?.sms_vorlauf_tage?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.sms_uhrzeit}>
				<FieldLabel htmlFor="sms_uhrzeit">Uhrzeit</FieldLabel>
				<Input
					id="sms_uhrzeit"
					name="sms_uhrzeit"
					type="time"
					// DB-Time liefert "08:00:00", das Zeitfeld erwartet "08:00".
					defaultValue={einstellungen.sms_uhrzeit.slice(0, 5)}
					aria-invalid={!!state.errors?.sms_uhrzeit}
				/>
				<FieldError>{state.errors?.sms_uhrzeit?.[0]}</FieldError>
			</Field>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			{state.success && (
				<p className="text-sm text-muted-foreground">
					Einstellungen gespeichert.
				</p>
			)}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending ? "Speichern…" : "Einstellungen speichern"}
			</Button>
		</form>
	);
}
