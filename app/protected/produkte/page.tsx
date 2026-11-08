import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProduktDialog } from "./produkt-dialog";
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
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">Produkte</h1>
					<p className="text-sm text-muted-foreground">
						Produkte mit Art und Größe anlegen und bearbeiten.
					</p>
				</div>

				<ProduktDialog
					mode="create"
					trigger={
						<Button>
							<Plus />
							Produkt anlegen
						</Button>
					}
				/>
			</div>

			<Suspense fallback={null}>
				<ErrorBanner searchParams={searchParams} />
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
