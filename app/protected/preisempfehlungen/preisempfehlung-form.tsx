"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { NumberField } from "@/components/ui/number-field";
import type { Preisempfehlung } from "@/lib/schemas/preisempfehlung";
import { selectClasses } from "../_crud/select-classes";
import { useServerForm } from "../_crud/use-server-form";
import {
	createPreisempfehlungAction,
	type PreisempfehlungFormState,
	updatePreisempfehlungAction,
} from "./actions";

const initialState: PreisempfehlungFormState = {};

type PreisempfehlungFormProps = {
	mode: "create" | "edit";
	saisonId: string;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
	empfehlung?: Preisempfehlung;
	onSuccess?: () => void;
};

export function PreisempfehlungForm({
	mode,
	saisonId,
	produkte,
	empfehlung,
	onSuccess,
}: PreisempfehlungFormProps) {
	const { state, isPending, formProps } = useServerForm(
		mode === "create"
			? createPreisempfehlungAction
			: updatePreisempfehlungAction,
		initialState,
		onSuccess,
	);

	return (
		<form {...formProps} className="flex flex-col gap-4">
			<input type="hidden" name="saison_id" value={saisonId} />
			{mode === "edit" && (
				<input type="hidden" name="id" defaultValue={empfehlung?.id} />
			)}

			<Field data-invalid={!!state.errors?.produkt_id}>
				<FieldLabel htmlFor={`${mode}-empfehlung-produkt`}>Produkt</FieldLabel>
				<select
					id={`${mode}-empfehlung-produkt`}
					name="produkt_id"
					className={selectClasses}
					defaultValue={empfehlung?.produkt_id ?? ""}
					aria-invalid={!!state.errors?.produkt_id}
					required
				>
					<option value="" disabled>
						Bitte wählen…
					</option>
					{produkte.map((produkt) => (
						<option key={produkt.id} value={produkt.id}>
							{produkt.art} {produkt.bezeichnung}
						</option>
					))}
				</select>
				<FieldError>{state.errors?.produkt_id?.[0]}</FieldError>
			</Field>

			<Field data-invalid={!!state.errors?.preis}>
				<FieldLabel htmlFor={`${mode}-empfehlung-preis`}>Preis (€)</FieldLabel>
				<NumberField
					id={`${mode}-empfehlung-preis`}
					name="preis"
					placeholder="z. B. 45,00"
					min={0.01}
					step={0.01}
					invalid={!!state.errors?.preis}
					defaultValue={empfehlung?.preis}
					required
				/>
				<FieldError>{state.errors?.preis?.[0]}</FieldError>
			</Field>

			{state.message && (
				<Alert variant="destructive">
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}

			<Button type="submit" disabled={isPending} className="self-end">
				{isPending
					? "Speichern…"
					: mode === "create"
						? "Preisempfehlung anlegen"
						: "Änderungen speichern"}
			</Button>
		</form>
	);
}
