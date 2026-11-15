/**
 * Erzeugt ein zufälliges Passwort aus kryptografisch sicheren Bytes:
 * crypto.randomUUID() liefert 122 Bit Entropie (32 Hex-Zeichen ohne Bindestriche).
 * Nutzt die Standard-API (Browser und Node ≥ 20) – bewusst ohne Zusatzpaket.
 */
export function erzeugePasswort(): string {
	return crypto.randomUUID().replaceAll("-", "");
}
