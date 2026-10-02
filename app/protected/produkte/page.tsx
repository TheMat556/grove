import { Suspense } from "react";
import { ProduktForm } from "./produkt-form";
import { ProdukteList } from "./produkte-list";

export default function ProduktePage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Produkte</h1>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Formular…</p>
				}
			>
				<ProduktForm mode="create" />
			</Suspense>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Produkte…</p>
				}
			>
				<ProdukteList />
			</Suspense>
		</div>
	);
}
