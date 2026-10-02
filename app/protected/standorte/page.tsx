import { Suspense } from "react";
import { StandortForm } from "./standort-form";
import { StandorteList } from "./standorte-list";

export default function StandortePage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Standorte</h1>

			<StandortForm mode="create" />

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Standorte…</p>
				}
			>
				<StandorteList />
			</Suspense>
		</div>
	);
}
