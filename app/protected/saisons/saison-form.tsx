"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSaisonAction, type SaisonFormState } from "./actions";

const initialState: SaisonFormState = {};

export function SaisonForm() {
	const [state, formAction, isPending] = useActionState(createSaisonAction, initialState);
	const formRef = useRef<HTMLFormElement>(null);

	// Nach erfolgreichem Anlegen das Formular zurücksetzen.
	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
		}
	}, [state.success]);

	return (
		<form ref={formRef} action={formAction} className="flex flex-col gap-4 max-w-md">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="name">Name</Label>
				<Input id="name" name="name" placeholder="z. B. Winter 2026" aria-invalid={!!state.errors?.name} />
				{state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="start_datum">Startdatum</Label>
				<Input id="start_datum" name="start_datum" type="date" aria-invalid={!!state.errors?.start_datum} />
				{state.errors?.start_datum && (
					<p className="text-sm text-destructive">{state.errors.start_datum[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="end_datum">Enddatum</Label>
				<Input id="end_datum" name="end_datum" type="date" aria-invalid={!!state.errors?.end_datum} />
				{state.errors?.end_datum && (
					<p className="text-sm text-destructive">{state.errors.end_datum[0]}</p>
				)}
			</div>

			{state.message && <p className="text-sm text-destructive">{state.message}</p>}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending ? "Speichern…" : "Saison anlegen"}
			</Button>
		</form>
	);
}
