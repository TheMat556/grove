"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	createStandortAction,
	type StandortFormState,
	updateStandortAction,
} from "./actions";

const initialState: StandortFormState = {};

type StandortFormProps = {
	mode: "create" | "edit";
	standort?: { id: string; plz: number; ort: string; adresse: string };
};

export function StandortForm({ mode, standort }: StandortFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createStandortAction : updateStandortAction,
		initialState,
	);
	const formRef = useRef<HTMLFormElement>(null);

	// Nach erfolgreichem Anlegen das Formular zurücksetzen (nur im Create-Modus).
	useEffect(() => {
		if (state.success && mode === "create") {
			formRef.current?.reset();
		}
	}, [state.success, mode]);

	return (
		<form
			ref={formRef}
			action={formAction}
			className="flex flex-col gap-4 max-w-md"
		>
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={standort?.id} />
			)}

			<Field data-invalid={!!state.errors?.plz}>
				<FieldLabel htmlFor="plz">PLZ</FieldLabel>
				<Input
					id="plz"
					name="plz"
					type="number"
					min={1000}
					max={9999}
					placeholder="1234"
					defaultValue={standort?.plz}
					aria-invalid={!!state.errors?.plz}
				/>
				<FieldError>{state.errors?.plz?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.ort}>
				<FieldLabel htmlFor="ort">Ort</FieldLabel>
				<Input
					id="ort"
					name="ort"
					placeholder="Wien"
					defaultValue={standort?.ort}
					aria-invalid={!!state.errors?.ort}
				/>
				<FieldError>{state.errors?.ort?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.adresse}>
				<FieldLabel htmlFor="adresse">Adresse</FieldLabel>
				<Input
					id="adresse"
					name="adresse"
					placeholder="Hauptplatz 1"
					defaultValue={standort?.adresse}
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
						? "Standort anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
