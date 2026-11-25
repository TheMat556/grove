"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type KundeWerte = {
	name: string;
	telefon: string;
	plz: string;
	adresse: string;
	ist_firma: boolean;
};

type KundeFelderProps = {
	/** Präfix für die DOM-ids – Formular und Inline-Panel können gleichzeitig existieren. */
	idPrefix: string;
	werte: KundeWerte;
	/** Feldfehler der Server-Action; validiert wird serverseitig. */
	fehler?: Record<string, string[] | undefined>;
	onChange: (werte: Partial<KundeWerte>) => void;
};

/**
 * Name, Telefon, PLZ, Adresse und Firmenkunde – die gemeinsamen Felder von
 * Kunden-Dialog und Inline-Anlage in der Reservierung. Kein `required`: Das
 * Inline-Panel liegt im Reservierungs-Formular, dessen native Validierung die
 * Fremdfelder sonst anmeckern würde – Feldfehler kommen aus der Action.
 */
export function KundeFelder({
	idPrefix,
	werte,
	fehler,
	onChange,
}: KundeFelderProps) {
	return (
		<>
			<Field data-invalid={!!fehler?.name}>
				<FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
				<Input
					id={`${idPrefix}-name`}
					name="name"
					placeholder="z. B. Maria Huber"
					value={werte.name}
					onChange={(event) => onChange({ name: event.target.value })}
					aria-invalid={!!fehler?.name}
				/>
				<FieldError>{fehler?.name?.[0]}</FieldError>
			</Field>

			<div className="grid gap-2 sm:grid-cols-2">
				<Field data-invalid={!!fehler?.telefon}>
					<FieldLabel htmlFor={`${idPrefix}-telefon`}>Telefon</FieldLabel>
					<Input
						id={`${idPrefix}-telefon`}
						name="telefon"
						placeholder="z. B. +43 664 1234567"
						value={werte.telefon}
						onChange={(event) => onChange({ telefon: event.target.value })}
						aria-invalid={!!fehler?.telefon}
					/>
					<FieldError>{fehler?.telefon?.[0]}</FieldError>
				</Field>

				<Field data-invalid={!!fehler?.plz}>
					<FieldLabel htmlFor={`${idPrefix}-plz`}>PLZ</FieldLabel>
					<Input
						id={`${idPrefix}-plz`}
						name="plz"
						placeholder="z. B. 3100"
						value={werte.plz}
						onChange={(event) => onChange({ plz: event.target.value })}
						aria-invalid={!!fehler?.plz}
					/>
					<FieldError>{fehler?.plz?.[0]}</FieldError>
				</Field>
			</div>

			<Field data-invalid={!!fehler?.adresse}>
				<FieldLabel htmlFor={`${idPrefix}-adresse`}>Adresse</FieldLabel>
				<Input
					id={`${idPrefix}-adresse`}
					name="adresse"
					placeholder="z. B. Bahnhofstraße 5"
					value={werte.adresse}
					onChange={(event) => onChange({ adresse: event.target.value })}
					aria-invalid={!!fehler?.adresse}
				/>
				<FieldError>{fehler?.adresse?.[0]}</FieldError>
			</Field>

			<div className="flex items-center gap-2">
				<Checkbox
					id={`${idPrefix}-ist_firma`}
					name="ist_firma"
					checked={werte.ist_firma}
					onCheckedChange={(checked) =>
						onChange({ ist_firma: checked === true })
					}
				/>
				<Label htmlFor={`${idPrefix}-ist_firma`}>Firmenkunde</Label>
			</div>
		</>
	);
}
