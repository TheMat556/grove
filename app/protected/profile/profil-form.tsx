"use client";

import { RefreshCw } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { erzeugePasswort } from "@/lib/passwort";
import { selectClasses } from "../_crud/select-classes";
import {
	createProfilAction,
	type ProfilFormState,
	updateProfilAction,
} from "./actions";

const initialState: ProfilFormState = {};

type ProfilFormValues = {
	id: string;
	name: string;
	rolle: string;
	telefon: string | null;
	aktiv: boolean;
};

type ProfilFormProps = {
	mode: "create" | "edit";
	profil?: ProfilFormValues;
	onSuccess?: () => void;
	/** Meldet dem Dialog, ob gerade gespeichert wird (Schließen blockieren). */
	onPendingChange?: (pending: boolean) => void;
};

/** Formular für ein Profil; meldet Erfolg an den umgebenden Dialog. */
export function ProfilForm({
	mode,
	profil,
	onSuccess,
	onPendingChange,
}: ProfilFormProps) {
	const [state, formAction, isPending] = useActionState(
		mode === "create" ? createProfilAction : updateProfilAction,
		initialState,
	);
	// Passwort wird beim Öffnen generiert und bleibt sichtbar – der Admin muss
	// es der neuen Person weitergeben. Nach Erfolg gilt das gesendete Passwort;
	// die Felder werden daher nicht weiter verändert.
	const [passwort, setPasswort] = useState(() => erzeugePasswort());
	const [email, setEmail] = useState("");

	useEffect(() => {
		if (state.success && mode === "edit") onSuccess?.();
	}, [state.success, mode, onSuccess]);

	useEffect(() => {
		onPendingChange?.(isPending);
		// Beim Unmount (z. B. Erfolgsanzeige) wieder freigeben.
		return () => onPendingChange?.(false);
	}, [isPending, onPendingChange]);

	// Nach dem Anlegen nur noch die Zugangsdaten zeigen: Formular unmountet,
	// damit die Werte nicht nachträglich verändert werden können.
	if (mode === "create" && state.success) {
		return (
			<Alert>
				<AlertTitle>Profil angelegt</AlertTitle>
				<AlertDescription>
					Zugangsdaten an die Person weitergeben: {email} · Passwort{" "}
					<code className="font-mono text-foreground">{passwort}</code>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-4">
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={profil?.id} />
			)}

			{mode === "create" && (
				<>
					<Field data-invalid={!!state.errors?.email}>
						<FieldLabel htmlFor="email">E-Mail</FieldLabel>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="z. B. maria@grove.de"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							// Während des Requests nicht änderbar: die Erfolgsanzeige
							// zeigt die tatsächlich gesendeten Zugangsdaten.
							disabled={isPending}
							aria-invalid={!!state.errors?.email}
						/>
						<FieldError>{state.errors?.email?.[0]}</FieldError>
					</Field>

					<Field data-invalid={!!state.errors?.passwort}>
						<FieldLabel htmlFor="passwort">Passwort</FieldLabel>
						<div className="flex gap-2">
							<Input
								id="passwort"
								name="passwort"
								className="font-mono"
								autoComplete="new-password"
								value={passwort}
								onChange={(e) => setPasswort(e.target.value)}
								disabled={isPending}
								aria-invalid={!!state.errors?.passwort}
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Passwort neu generieren"
								disabled={isPending}
								onClick={() => setPasswort(erzeugePasswort())}
							>
								<RefreshCw />
							</Button>
						</div>
						<FieldError>{state.errors?.passwort?.[0]}</FieldError>
					</Field>
				</>
			)}

			<Field data-invalid={!!state.errors?.name}>
				<FieldLabel htmlFor="name">Name</FieldLabel>
				<Input
					id="name"
					name="name"
					placeholder="z. B. Maria Huber"
					defaultValue={profil?.name}
					aria-invalid={!!state.errors?.name}
				/>
				<FieldError>{state.errors?.name?.[0]}</FieldError>
			</Field>

			{mode === "create" ? (
				<Field data-invalid={!!state.errors?.rolle}>
					<FieldLabel htmlFor="rolle">Rolle</FieldLabel>
					<select
						id="rolle"
						name="rolle"
						className={selectClasses}
						defaultValue={profil?.rolle ?? "mitarbeiter"}
						aria-invalid={!!state.errors?.rolle}
					>
						<option value="mitarbeiter">Mitarbeitend</option>
						<option value="admin">Admin</option>
					</select>
					<FieldError>{state.errors?.rolle?.[0]}</FieldError>
				</Field>
			) : (
				/* Rolle ist beim Bearbeiten read-only – Änderungen sind out of scope */
				<p className="text-sm text-muted-foreground">Rolle: {profil?.rolle}</p>
			)}

			<Field data-invalid={!!state.errors?.telefon}>
				<FieldLabel htmlFor="telefon">Telefon</FieldLabel>
				<Input
					id="telefon"
					name="telefon"
					placeholder="z. B. +43 664 1234567"
					defaultValue={profil?.telefon ?? ""}
					aria-invalid={!!state.errors?.telefon}
				/>
				<FieldError>{state.errors?.telefon?.[0]}</FieldError>
			</Field>

			<div className="flex items-center gap-2">
				<Checkbox
					id="aktiv"
					name="aktiv"
					defaultChecked={profil?.aktiv ?? true}
				/>
				<Label htmlFor="aktiv">Aktiv</Label>
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
						? "Profil anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
