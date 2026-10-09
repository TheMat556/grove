"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ProfilFormState, updateProfilAction } from "./actions";

const initialState: ProfilFormState = {};

type ProfilFormProps = {
	profil: {
		id: string;
		name: string;
		rolle: string;
		telefon: string | null;
		aktiv: boolean;
	};
};

export function ProfilForm({ profil }: ProfilFormProps) {
	const [state, formAction, isPending] = useActionState(
		updateProfilAction,
		initialState,
	);

	return (
		<form action={formAction} className="flex flex-col gap-4 max-w-md">
			<input type="hidden" name="id" defaultValue={profil.id} />

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					name="name"
					placeholder="z. B. Maria Huber"
					defaultValue={profil.name}
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
					defaultValue={profil.telefon ?? ""}
					aria-invalid={!!state.errors?.telefon}
				/>
				{state.errors?.telefon && (
					<p className="text-sm text-destructive">{state.errors.telefon[0]}</p>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Checkbox id="aktiv" name="aktiv" defaultChecked={profil.aktiv} />
				<Label htmlFor="aktiv">Aktiv</Label>
			</div>

			{/* Rolle ist read-only – Änderungen sind out of scope */}
			<p className="text-sm text-muted-foreground">Rolle: {profil.rolle}</p>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending ? "Speichern…" : "Änderungen speichern"}
			</Button>
		</form>
	);
}
