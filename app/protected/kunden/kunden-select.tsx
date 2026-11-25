"use client";

import { Combobox } from "@base-ui/react/combobox";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type KundeOption = { id: string; name: string };

/** Eintrag der Liste: ein Kunde oder der immer letzte Anlegen-Eintrag. */
type Eintrag = { value: string; label: string; anlegen?: true };

const ANLEGEN_WERT = "__anlegen__";

type KundenSelectProps = {
	/** DOM-id des Suchfelds (für FieldLabel/ARIA des umgebenden Formulars). */
	id: string;
	kunden: KundeOption[];
	value: string;
	onChange: (kundeId: string) => void;
	onAnlegen: () => void;
	invalid?: boolean;
};

/**
 * Durchsuchbare Kunden-Auswahl: zeigt maximal 5 Einträge, der letzte ist immer
 * „Kunde anlegen". Die Liste kommt bereits vorgefiltert (filter={null}), damit
 * die 4-Kunden-Grenze gilt und der Anlegen-Eintrag nie herausgefiltert wird.
 */
export function KundenSelect({
	id,
	kunden,
	value,
	onChange,
	onAnlegen,
	invalid,
}: KundenSelectProps) {
	const [suche, setSuche] = useState("");
	const [offen, setOffen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const suchbegriff = suche.trim().toLowerCase();
	const treffer = suchbegriff
		? kunden.filter((kunde) => kunde.name.toLowerCase().includes(suchbegriff))
		: kunden;
	// Maximal 4 Kunden + angehefteter Anlegen-Eintrag = 5 Zeilen.
	const eintraege: Eintrag[] = [
		...treffer
			.slice(0, 4)
			.map((kunde) => ({ value: kunde.id, label: kunde.name })),
		{
			value: ANLEGEN_WERT,
			label: suche.trim() ? `+ „${suche.trim()}" anlegen` : "+ Kunde anlegen",
			anlegen: true,
		},
	];
	// Auswahl aus der vollen Kundenliste auflösen: der selektierte Kunde kann
	// außerhalb der vier angezeigten Treffer liegen (z. B. beim Bearbeiten).
	const gewaehlterKunde = value
		? kunden.find((kunde) => kunde.id === value)
		: undefined;
	const gewaehlt: Eintrag | null = gewaehlterKunde
		? { value: gewaehlterKunde.id, label: gewaehlterKunde.name }
		: null;

	function auswahl(eintrag: Eintrag | null) {
		if (!eintrag) return;
		if (eintrag.anlegen) {
			setSuche("");
			setOffen(false);
			onAnlegen();
			return;
		}
		onChange(eintrag.value);
		setSuche("");
		inputRef.current?.focus();
	}

	return (
		<Combobox.Root
			items={eintraege}
			value={gewaehlt}
			onValueChange={auswahl}
			isItemEqualToValue={(a, b) => a.value === b.value}
			onInputValueChange={(next) => setSuche(next)}
			filter={null}
			open={offen}
			onOpenChange={setOffen}
			autoHighlight
			autoComplete="off"
			name="kunde_id"
		>
			<Combobox.Input
				id={id}
				ref={inputRef}
				aria-invalid={invalid}
				placeholder="Kunde suchen oder anlegen…"
				className={cn(
					"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50",
				)}
			/>
			<Combobox.Portal>
				<Combobox.Positioner
					sideOffset={4}
					className="isolate z-50 outline-none"
				>
					<Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] rounded-lg border bg-popover text-popover-foreground shadow-md">
						<Combobox.List className="max-h-64 overflow-auto overscroll-contain p-1 outline-none">
							{(eintrag: Eintrag) => (
								<Combobox.Item
									key={eintrag.value}
									value={eintrag}
									className={cn(
										"cursor-pointer truncate rounded-md px-2 py-1.5 outline-none select-none data-highlighted:bg-muted data-selected:font-medium",
										eintrag.anlegen &&
											"sticky bottom-0 border-t bg-popover text-muted-foreground",
									)}
								>
									{eintrag.label}
								</Combobox.Item>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
