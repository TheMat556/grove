"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Kunde } from "@/lib/schemas/kunde";
import {
	createKundeAction,
	type KundeFormState,
	updateKundeAction,
} from "./actions";

const initialState: KundeFormState = {};

type KundeFormProps = {
	mode: "create" | "edit";
	kunde?: Kunde;
};

export function KundeForm({ mode, kunde }: KundeFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createKundeAction : updateKundeAction,
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
				<input type="hidden" name="id" defaultValue={kunde?.id} />
			)}

			<Field data-invalid={!!state.errors?.name}>
				<FieldLabel htmlFor="name">Name</FieldLabel>
				<Input
					id="name"
					name="name"
					placeholder="z. B. Maria Huber"
					defaultValue={kunde?.name}
					aria-invalid={!!state.errors?.name}
				/>
				<FieldError>{state.errors?.name?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.telefon}>
				<FieldLabel htmlFor="telefon">Telefon</FieldLabel>
				<Input
					id="telefon"
					name="telefon"
					placeholder="z. B. +43 664 1234567"
					defaultValue={kunde?.telefon}
					aria-invalid={!!state.errors?.telefon}
				/>
				<FieldError>{state.errors?.telefon?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.adresse}>
				<FieldLabel htmlFor="adresse">Adresse</FieldLabel>
				<Input
					id="adresse"
					name="adresse"
					placeholder="z. B. Bahnhofstraße 5"
					defaultValue={kunde?.adresse}
					aria-invalid={!!state.errors?.adresse}
				/>
				<FieldError>{state.errors?.adresse?.[0]}</FieldError>
			</Field>

			<div className="flex items-center gap-2">
				<Checkbox
					id="ist_firma"
					name="ist_firma"
					defaultChecked={kunde?.ist_firma}
				/>
				<Label htmlFor="ist_firma">Firmenkunde</Label>
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
						? "Kunde anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
