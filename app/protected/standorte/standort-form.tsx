"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
				<input type="hidden" name="id" value={standort?.id} />
			)}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="plz">PLZ</Label>
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
				{state.errors?.plz && (
					<p className="text-sm text-destructive">{state.errors.plz[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="ort">Ort</Label>
				<Input
					id="ort"
					name="ort"
					placeholder="Wien"
					defaultValue={standort?.ort}
					aria-invalid={!!state.errors?.ort}
				/>
				{state.errors?.ort && (
					<p className="text-sm text-destructive">{state.errors.ort[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="adresse">Adresse</Label>
				<Input
					id="adresse"
					name="adresse"
					placeholder="Hauptplatz 1"
					defaultValue={standort?.adresse}
					aria-invalid={!!state.errors?.adresse}
				/>
				{state.errors?.adresse && (
					<p className="text-sm text-destructive">{state.errors.adresse[0]}</p>
				)}
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
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
