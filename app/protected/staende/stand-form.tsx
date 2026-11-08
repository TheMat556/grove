"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { StandMitStandort } from "@/lib/data/stand";
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
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createStandAction : updateStandAction,
		initialState,
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!state.success) return;
		formRef.current?.reset();
		onSuccess?.();
	}, [state.success, onSuccess]);

	return (
		<form ref={formRef} action={formAction} className="flex flex-col gap-4">
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
				<Input
					id={`${mode}-plz`}
					name="plz"
					type="number"
					min={1000}
					max={9999}
					placeholder="1234"
					defaultValue={stand?.standort?.plz}
					aria-invalid={!!state.errors?.plz}
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
