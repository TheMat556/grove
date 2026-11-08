"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { getStandorte } from "@/lib/data/standort";
import { selectClasses } from "../_crud/select-classes";
import {
	createStandAction,
	type StandFormState,
	updateStandAction,
} from "./actions";

const initialState: StandFormState = {};

type Standorte = Awaited<ReturnType<typeof getStandorte>>;

type StandFormProps = {
	mode: "create" | "edit";
	standorte: Standorte;
	stand?: { id: string; standort_id: string; bezeichnung: string };
};

export function StandForm({ mode, standorte, stand }: StandFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createStandAction : updateStandAction,
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
				<input type="hidden" name="id" defaultValue={stand?.id} />
			)}

			<Field data-invalid={!!state.errors?.bezeichnung}>
				<FieldLabel htmlFor="bezeichnung">Bezeichnung</FieldLabel>
				<Input
					id="bezeichnung"
					name="bezeichnung"
					placeholder="z. B. Obst & Gemüse"
					defaultValue={stand?.bezeichnung}
					aria-invalid={!!state.errors?.bezeichnung}
				/>
				<FieldError>{state.errors?.bezeichnung?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.standort_id}>
				<FieldLabel htmlFor="standort_id">Standort</FieldLabel>
				<select
					id="standort_id"
					name="standort_id"
					defaultValue={stand?.standort_id ?? ""}
					className={selectClasses}
					aria-invalid={!!state.errors?.standort_id}
				>
					<option value="" disabled>
						Standort wählen…
					</option>
					{standorte.map((standort) => (
						<option key={standort.id} value={standort.id}>
							{standort.plz} {standort.ort}
						</option>
					))}
				</select>
				<FieldError>{state.errors?.standort_id?.[0]}</FieldError>
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
