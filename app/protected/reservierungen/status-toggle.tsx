import { CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setzeReservierungStatusAction } from "./actions";

type ReservierungStatusToggleProps = {
	id: string;
	status: string;
	/** icon-xs für kompakte Zeilen (z. B. Reservierungszeile in Verkäufe). */
	size?: "icon-xs" | "icon-sm";
};

/**
 * Status-Toggle für Listen: offen → erfuellt und zurück. Stornierte bleiben
 * unangetastet – ein Storno wird im Bearbeiten-Dialog aufgehoben.
 */
export function ReservierungStatusToggle({
	id,
	status,
	size = "icon-sm",
}: ReservierungStatusToggleProps) {
	if (status === "storniert") return null;

	const erfuellt = status === "erfuellt";
	const ziel = erfuellt ? "offen" : "erfuellt";
	const label = erfuellt
		? "Reservierung wieder öffnen"
		: "Reservierung als erfüllt markieren";

	return (
		<form action={setzeReservierungStatusAction}>
			<input type="hidden" name="id" value={id} />
			<input type="hidden" name="status" value={ziel} />
			<Button
				type="submit"
				variant="ghost"
				size={size}
				aria-label={label}
				title={label}
				className={
					erfuellt
						? "text-muted-foreground"
						: "text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
				}
			>
				{erfuellt ? <Undo2 /> : <CheckCircle2 />}
			</Button>
		</form>
	);
}
