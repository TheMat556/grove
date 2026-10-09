import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getKunde } from "@/lib/data/kunde";
import { KundeForm } from "../kunde-form";

export default function KundeEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Kunde…</p>}
			>
				<KundeEdit params={params} />
			</Suspense>
		</div>
	);
}

async function KundeEdit({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const kunde = await getKunde(id);

	if (!kunde) {
		notFound();
	}

	return (
		<>
			<h1 className="font-bold text-2xl">Kunde bearbeiten: {kunde.name}</h1>

			<KundeForm mode="edit" kunde={kunde} />
		</>
	);
}
