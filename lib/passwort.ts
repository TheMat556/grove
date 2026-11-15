/**
 * Erzeugt ein zufälliges Passwort aus kryptografisch sicheren Bytes.
 *
 * 12 Bytes → 16 Zeichen base64url (A–Z a–z 0–9 - _), also 96 Bit Entropie.
 * Nutzt Web Crypto (Browser und Node ≥ 20) – bewusst ohne Zusatzpaket.
 */
export function erzeugePasswort(bytes = 12): string {
	const werte = crypto.getRandomValues(new Uint8Array(bytes));
	return btoa(String.fromCharCode(...werte))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}
