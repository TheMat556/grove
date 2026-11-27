"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { selectClasses } from "./_crud/select-classes";

const ALLE_STAENDE = "alle";

type DashboardStandFilterProps = {
	staende: Array<{ id: string; bezeichnung: string }>;
	/** Fehlt = alle Stände. */
	selectedId?: string;
};

/**
 * Allgemeiner Stand-Filter im Dashboard-Kopf. Schreibt den Stand als
 * `?stand=<id>` in die URL; der Server filtert damit alle Dashboard-Daten.
 */
export function DashboardStandFilter({
	staende,
	selectedId,
}: DashboardStandFilterProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function waehle(standId: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (standId === ALLE_STAENDE) {
			params.delete("stand");
		} else {
			params.set("stand", standId);
		}

		const query = params.toString();
		router.push(query ? `${pathname}?${query}` : pathname);
	}

	return (
		<select
			aria-label="Stand"
			value={selectedId ?? ALLE_STAENDE}
			onChange={(event) => waehle(event.target.value)}
			className={cn(selectClasses, "w-auto")}
		>
			<option value={ALLE_STAENDE}>Alle Stände</option>
			{staende.map((stand) => (
				<option key={stand.id} value={stand.id}>
					{stand.bezeichnung}
				</option>
			))}
		</select>
	);
}
