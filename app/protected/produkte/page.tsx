import { Suspense } from "react";
import { ProduktForm } from "./produkt-form";
import { ProdukteList } from "./produkte-list";

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

export default function ProduktePage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Produkte</h1>

			<Suspense fallback={null}>
				<ErrorBanner searchParams={searchParams} />
			</Suspense>

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
