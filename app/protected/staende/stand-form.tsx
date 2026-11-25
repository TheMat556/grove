"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberField } from "@/components/ui/number-field";
import type { StandMitStandort } from "@/lib/data/stand";
import { useServerForm } from "../_crud/use-server-form";
import {
	createStandAction,
	type StandFormState,
	updateStandAction,
} from "./actions";

const initialState: StandFormState = {};

type StandFormProps = {
	mode: "create" | "edit";
	stand?: StandMitStandort;
	onSuccess?: () => void;
};

export function StandForm({ mode, stand, onSuccess }: StandFormProps) {
	const { state, isPending, formProps } = useServerForm(
		mode === "create" ? createStandAction : updateStandAction,
		initialState,
		onSuccess,
	);

	return (
		<form {...formProps} className="flex flex-col gap-4">
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={stand?.id} />
			)}

			<Field data-invalid={!!state.errors?.bezeichnung}>
				<FieldLabel htmlFor={`${mode}-bezeichnung`}>Bezeichnung</FieldLabel>
				<Input
					id={`${mode}-bezeichnung`}
					name="bezeichnung"
					placeholder="z. B. Obst & Gemüse"
					defaultValue={stand?.bezeichnung}
					aria-invalid={!!state.errors?.bezeichnung}
				/>
				<FieldError>{state.errors?.bezeichnung?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.plz}>
				<FieldLabel htmlFor={`${mode}-plz`}>PLZ</FieldLabel>
				<NumberField
					id={`${mode}-plz`}
					name="plz"
					min={1000}
					max={9999}
					placeholder="1234"
					defaultValue={stand?.standort?.plz}
					invalid={!!state.errors?.plz}
				/>
				<FieldError>{state.errors?.plz?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.ort}>
				<FieldLabel htmlFor={`${mode}-ort`}>Ort</FieldLabel>
				<Input
					id={`${mode}-ort`}
					name="ort"
					placeholder="Wien"
					defaultValue={stand?.standort?.ort}
					aria-invalid={!!state.errors?.ort}
				/>
				<FieldError>{state.errors?.ort?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.adresse}>
				<FieldLabel htmlFor={`${mode}-adresse`}>Adresse</FieldLabel>
				<Input
					id={`${mode}-adresse`}
					name="adresse"
					placeholder="Hauptplatz 1"
					defaultValue={stand?.standort?.adresse}
					aria-invalid={!!state.errors?.adresse}
				/>
				<FieldError>{state.errors?.adresse?.[0]}</FieldError>
			</Field>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending
					? "Speichern…"
					: mode === "create"
						? "Stand anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
