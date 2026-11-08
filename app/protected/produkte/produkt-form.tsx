"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { selectClasses } from "../_crud/select-classes";
import {
	createProduktAction,
	type ProduktFormState,
	updateProduktAction,
} from "./actions";

const initialState: ProduktFormState = {};

export type ProduktFormValues = {
	id: string;
	art: string;
	bezeichnung: string;
	von_cm: number;
	bis_cm: number;
};

type ProduktFormProps = {
	mode: "create" | "edit";
	produkt?: ProduktFormValues;
	onSuccess?: () => void;
};

/** Formular für ein Produkt; meldet Erfolg an den umgebenden Dialog. */
export function ProduktForm({ mode, produkt, onSuccess }: ProduktFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createProduktAction : updateProduktAction,
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
				<input type="hidden" name="id" defaultValue={produkt?.id} />
			)}

			<Field data-invalid={!!state.errors?.art}>
				<FieldLabel htmlFor={`${mode}-art`}>Art</FieldLabel>
				<select
					id={`${mode}-art`}
					name="art"
					className={selectClasses}
					defaultValue={produkt?.art ?? ""}
					aria-invalid={!!state.errors?.art}
				>
					<option value="" disabled>
						Bitte wählen…
					</option>
					<option value="Baum">Baum</option>
					<option value="Kreuz">Kreuz</option>
				</select>
				<FieldError>{state.errors?.art?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.bezeichnung}>
				<FieldLabel htmlFor={`${mode}-bezeichnung`}>Bezeichnung</FieldLabel>
				<Input
					id={`${mode}-bezeichnung`}
					name="bezeichnung"
					placeholder="z. B. Nordmanntanne"
					defaultValue={produkt?.bezeichnung}
					aria-invalid={!!state.errors?.bezeichnung}
				/>
				<FieldError>{state.errors?.bezeichnung?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.von_cm}>
				<FieldLabel htmlFor={`${mode}-von_cm`}>Größe von (cm)</FieldLabel>
				<Input
					id={`${mode}-von_cm`}
					name="von_cm"
					type="number"
					min={1}
					required
					placeholder="100"
					defaultValue={produkt?.von_cm}
					aria-invalid={!!state.errors?.von_cm}
				/>
				<FieldError>{state.errors?.von_cm?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.bis_cm}>
				<FieldLabel htmlFor={`${mode}-bis_cm`}>Größe bis (cm)</FieldLabel>
				<Input
					id={`${mode}-bis_cm`}
					name="bis_cm"
					type="number"
					min={1}
					required
					placeholder="200"
					defaultValue={produkt?.bis_cm}
					aria-invalid={!!state.errors?.bis_cm}
				/>
				<FieldError>{state.errors?.bis_cm?.[0]}</FieldError>
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
						? "Produkt anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
