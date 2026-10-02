import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProdukt } from "@/lib/data/produkt";
import { ProduktForm } from "../produkt-form";

export default function ProduktEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Produkt…</p>
				}
			>
				<ProduktEdit params={params} />
			</Suspense>
		</div>
	);
}

async function ProduktEdit({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const produkt = await getProdukt(id);

	if (!produkt) {
		notFound();
	}

	return (
		<>
			<h1 className="font-bold text-2xl">
				Produkt bearbeiten: {produkt.bezeichnung}
			</h1>

			<ProduktForm mode="edit" produkt={produkt} />
		</>
	);
}
