import { Suspense } from "react";
import { KundeForm } from "./kunde-form";
import { KundenList } from "./kunden-list";

export default function KundenPage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Kunden</h1>

			<KundeForm mode="create" />

			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Kunden…</p>}
			>
				<KundenList />
			</Suspense>
		</div>
	);
}
