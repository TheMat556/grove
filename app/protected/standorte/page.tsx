import { Suspense } from "react";
import { StandortForm } from "./standort-form";
import { StandorteList } from "./standorte-list";

async function ErrorBanner({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	if (!error) return null;

	return (
		<p className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
			{error}
		</p>
	);
}

export default function StandortePage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Standorte</h1>

			<Suspense fallback={null}>
				<ErrorBanner searchParams={searchParams} />
			</Suspense>

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
