type Adresse = {
	adresse: string;
	/** Standort-PLZ ist eine Zahl, Kunden-PLZ ein Text. */
	plz: number | string;
	/** Nur beim Standort vorhanden. */
	ort?: string;
};

/**
 * Google-Maps-Suche-Link für eine Adresse (Kunde oder Standort). Ohne Adresse
 * kein Link – Aufrufer prüfen den Rückgabewert.
 */
export function googleMapsUrl(adresse: Adresse | null): string | undefined {
	if (!adresse) return undefined;

	const ort = [adresse.plz, adresse.ort].filter(Boolean).join(" ");
	const query = [adresse.adresse, ort].filter(Boolean).join(", ");
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
