"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SAISON_COOKIE } from "@/lib/saison";

type SaisonOption = { id: string; name: string };

/**
 * Saison-Auswahl im Header. Die Wahl landet in einem Cookie, damit auch
 * Server Components (saisonabhängige Listen) sie lesen können; router.refresh()
 * rendert die aktuelle Seite mit der neuen Auswahl neu.
 */
export function SaisonSelect({
	saisons,
	selectedId,
}: {
	saisons: SaisonOption[];
	selectedId: string;
}) {
	const router = useRouter();
	const [value, setValue] = useState(selectedId);

	useEffect(() => {
		setValue(selectedId);
	}, [selectedId]);

	const items = saisons.map((saison) => ({
		value: saison.id,
		label: saison.name,
	}));

	function handleChange(next: string | null) {
		if (!next || next === value) return;
		setValue(next);
		const maxAge = 60 * 60 * 24 * 365;
		// biome-ignore lint/suspicious/noDocumentCookie: UI-Präferenz, kein Geheimnis; die Cookie Store API ist nicht überall verfügbar.
		document.cookie = `${SAISON_COOKIE}=${next}; path=/; max-age=${maxAge}; samesite=lax`;
		router.refresh();
	}

	return (
		<Select items={items} value={value} onValueChange={handleChange}>
			<SelectTrigger
				className="w-36 sm:w-44"
				size="sm"
				aria-label="Saison auswählen"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align="end">
				{items.map((item) => (
					<SelectItem key={item.value} value={item.value}>
						{item.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
