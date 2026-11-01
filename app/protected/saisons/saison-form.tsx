"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`${mode}-name`}>Name</Label>
				<Input
					id={`${mode}-name`}
					name="name"
					placeholder="z. B. Winter 2026"
					defaultValue={saison?.name}
					aria-invalid={!!state.errors?.name}
				/>
				{state.errors?.name && (
					<p className="text-sm text-destructive">{state.errors.name[0]}</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`${mode}-start_datum`}>Startdatum</Label>
					<DatePicker
						id={`${mode}-start_datum`}
						name="start_datum"
						defaultValue={saison?.start_datum}
						invalid={!!state.errors?.start_datum}
					/>
					{state.errors?.start_datum && (
						<p className="text-sm text-destructive">
							{state.errors.start_datum[0]}
						</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`${mode}-end_datum`}>Enddatum</Label>
					<DatePicker
						id={`${mode}-end_datum`}
						name="end_datum"
						defaultValue={saison?.end_datum}
						invalid={!!state.errors?.end_datum}
					/>
					{state.errors?.end_datum && (
						<p className="text-sm text-destructive">
							{state.errors.end_datum[0]}
						</p>
					)}
				</div>
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
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
