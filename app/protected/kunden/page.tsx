import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { KundeDialog } from "./kunde-dialog";
import { KundenList } from "./kunden-list";

/** Kunden-Seite: Kopfzeile mit Anlegen-Dialog, darunter die Kundenliste. */
export default function KundenPage() {
	return (
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">Kunden</h1>
					<p className="text-sm text-muted-foreground">
						Kunden mit Kontaktdaten anlegen und bearbeiten.
					</p>
				</div>

				<KundeDialog
					mode="create"
					trigger={
						<Button>
							<Plus />
							Kunde anlegen
						</Button>
					}
				/>
			</div>

			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Kunden…</p>}
			>
				<KundenList />
			</Suspense>
		</div>
	);
}
