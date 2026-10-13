import { Suspense } from "react";
import { StandortForm } from "./standort-form";
import { StandorteList } from "./standorte-list";

export default async function StandortePage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;

	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Standorte</h1>

			{error && (
				<p className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
					{error}
				</p>
			)}

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
