import { Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
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
