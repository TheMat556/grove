/** FormData aus Schlüssel-Wert-Paaren – gemeinsamer Helfer für Action-Tests. */
export function formMitWerten(werte: Record<string, string>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(werte)) {
		formData.set(key, value);
	}
	return formData;
}
