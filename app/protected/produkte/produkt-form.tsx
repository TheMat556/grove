"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
	createProduktAction,
	type ProduktFormState,
	updateProduktAction,
} from "./actions";

const initialState: ProduktFormState = {};

const selectClasses =
	"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

type ProduktFormProps = {
	mode: "create" | "edit";
	produkt?: {
		id: string;
		art: string;
		bezeichnung: string;
		von_cm: number;
		bis_cm: number;
	};
};

export function ProduktForm({ mode, produkt }: ProduktFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createProduktAction : updateProduktAction,
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
			{mode === "edit" && <input type="hidden" name="id" value={produkt?.id} />}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="art">Art</Label>
				<select
					id="art"
					name="art"
					className={cn(selectClasses, "text-foreground")}
					defaultValue={produkt?.art ?? ""}
					aria-invalid={!!state.errors?.art}
				>
					<option value="" disabled>
						Bitte wählen…
					</option>
					<option value="Baum">Baum</option>
					<option value="Kreuz">Kreuz</option>
				</select>
				{state.errors?.art && (
					<p className="text-sm text-destructive">{state.errors.art[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="bezeichnung">Bezeichnung</Label>
				<Input
					id="bezeichnung"
					name="bezeichnung"
					placeholder="z. B. Nordmanntanne"
					defaultValue={produkt?.bezeichnung}
					aria-invalid={!!state.errors?.bezeichnung}
				/>
				{state.errors?.bezeichnung && (
					<p className="text-sm text-destructive">
						{state.errors.bezeichnung[0]}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="von_cm">Größe von (cm)</Label>
				<Input
					id="von_cm"
					name="von_cm"
					type="number"
					min={0}
					placeholder="100"
					defaultValue={produkt?.von_cm}
					aria-invalid={!!state.errors?.von_cm}
				/>
				{state.errors?.von_cm && (
					<p className="text-sm text-destructive">{state.errors.von_cm[0]}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="bis_cm">Größe bis (cm)</Label>
				<Input
					id="bis_cm"
					name="bis_cm"
					type="number"
					min={0}
					placeholder="200"
					defaultValue={produkt?.bis_cm}
					aria-invalid={!!state.errors?.bis_cm}
				/>
				{state.errors?.bis_cm && (
					<p className="text-sm text-destructive">{state.errors.bis_cm[0]}</p>
				)}
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<Button type="submit" disabled={isPending} className="self-start">
				{isPending
					? "Speichern…"
					: mode === "create"
						? "Produkt anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
