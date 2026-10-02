"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	createKundeAction,
	type KundeFormState,
	updateKundeAction,
} from "./actions";

const initialState: KundeFormState = {};

type KundeFormProps = {
	mode: "create" | "edit";
	kunde?: {
		id: string;
		name: string;
		telefon: string;
		adresse: string;
		ist_firma: boolean;
	};
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
			{mode === "edit" && <input type="hidden" name="id" value={kunde?.id} />}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					name="name"
					placeholder="z. B. Maria Huber"
					defaultValue={kunde?.name}
					aria-invalid={!!state.errors?.name}
				/>
				{state.errors?.name && (
					<p className="text-sm text-destructive">{state.errors.name[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="telefon">Telefon</Label>
				<Input
					id="telefon"
					name="telefon"
					placeholder="z. B. +43 664 1234567"
					defaultValue={kunde?.telefon}
					aria-invalid={!!state.errors?.telefon}
				/>
				{state.errors?.telefon && (
					<p className="text-sm text-destructive">{state.errors.telefon[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="adresse">Adresse</Label>
				<Input
					id="adresse"
					name="adresse"
					placeholder="z. B. Bahnhofstraße 5"
					defaultValue={kunde?.adresse}
					aria-invalid={!!state.errors?.adresse}
				/>
				{state.errors?.adresse && (
					<p className="text-sm text-destructive">{state.errors.adresse[0]}</p>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					id="ist_firma"
					name="ist_firma"
					defaultChecked={kunde?.ist_firma}
				/>
				<Label htmlFor="ist_firma">Firmenkunde</Label>
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
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
