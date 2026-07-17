import { Suspense } from "react";
import { SaisonForm } from "./saison-form";
import { SaisonsList } from "./saisons-list";

export default function SaisonsPage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Saisons</h1>

			<SaisonForm />

			<Suspense fallback={<p className="text-sm text-muted-foreground">Lade Saisons…</p>}>
				<SaisonsList />
			</Suspense>
		</div>
	);
}
