"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Saison } from "@/lib/schemas/saison";
import {
	createSaisonAction,
	type SaisonFormState,
	updateSaisonAction,
} from "./actions";
import { DatePicker } from "./date-picker";

const initialState: SaisonFormState = {};

type SaisonFormProps = {
	mode: "create" | "edit";
	saison?: Saison;
	onSuccess?: () => void;
};

export function SaisonForm({ mode, saison, onSuccess }: SaisonFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createSaisonAction : updateSaisonAction,
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
				<input type="hidden" name="id" defaultValue={saison?.id} />
			)}

			<Field data-invalid={!!state.errors?.name}>
				<FieldLabel htmlFor={`${mode}-name`}>Name</FieldLabel>
				<Input
					id={`${mode}-name`}
					name="name"
					placeholder="z. B. Winter 2026"
					defaultValue={saison?.name}
					aria-invalid={!!state.errors?.name}
				/>
				<FieldError>{state.errors?.name?.[0]}</FieldError>
			</Field>

			<div className="grid grid-cols-2 gap-3">
				<Field data-invalid={!!state.errors?.start_datum}>
					<FieldLabel htmlFor={`${mode}-start_datum`}>Startdatum</FieldLabel>
					<DatePicker
						id={`${mode}-start_datum`}
						name="start_datum"
						defaultValue={saison?.start_datum}
						invalid={!!state.errors?.start_datum}
					/>
					<FieldError>{state.errors?.start_datum?.[0]}</FieldError>
				</Field>

				<Field data-invalid={!!state.errors?.end_datum}>
					<FieldLabel htmlFor={`${mode}-end_datum`}>Enddatum</FieldLabel>
					<DatePicker
						id={`${mode}-end_datum`}
						name="end_datum"
						defaultValue={saison?.end_datum}
						invalid={!!state.errors?.end_datum}
					/>
					<FieldError>{state.errors?.end_datum?.[0]}</FieldError>
				</Field>
			</div>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending
					? "Speichern…"
					: mode === "create"
						? "Saison anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
