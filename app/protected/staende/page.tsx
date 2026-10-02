import { Suspense } from "react";
import { getStandorte } from "@/lib/data/standort";
import { StaendeList } from "./staende-list";
import { StandForm } from "./stand-form";

async function StandFormMitStandorten() {
	const standorte = await getStandorte();
	return <StandForm mode="create" standorte={standorte} />;
}

export default function StaendePage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Stände</h1>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Standorte…</p>
				}
			>
				<StandFormMitStandorten />
			</Suspense>

			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Stände…</p>}
			>
				<StaendeList />
			</Suspense>
		</div>
	);
}
