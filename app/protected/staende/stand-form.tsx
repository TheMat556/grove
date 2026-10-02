"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { getStandorte } from "@/lib/data/standort";
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
			{mode === "edit" && <input type="hidden" name="id" value={stand?.id} />}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="bezeichnung">Bezeichnung</Label>
				<Input
					id="bezeichnung"
					name="bezeichnung"
					placeholder="z. B. Obst & Gemüse"
					defaultValue={stand?.bezeichnung}
					aria-invalid={!!state.errors?.bezeichnung}
				/>
				{state.errors?.bezeichnung && (
					<p className="text-sm text-destructive">
						{state.errors.bezeichnung[0]}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="standort_id">Standort</Label>
				<select
					id="standort_id"
					name="standort_id"
					defaultValue={stand?.standort_id ?? ""}
					className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
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
				{state.errors?.standort_id && (
					<p className="text-sm text-destructive">
						{state.errors.standort_id[0]}
					</p>
				)}
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
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
