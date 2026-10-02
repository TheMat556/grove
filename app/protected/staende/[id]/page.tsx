import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getStand } from "@/lib/data/stand";
import { getStandorte } from "@/lib/data/standort";
import { StandForm } from "../stand-form";

export default function StandEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Stand…</p>}
			>
				<StandEdit params={params} />
			</Suspense>
		</div>
	);
}

async function StandEdit({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const [stand, standorte] = await Promise.all([getStand(id), getStandorte()]);

	if (!stand) {
		notFound();
	}

	return (
		<>
			<h1 className="font-bold text-2xl">
				Stand bearbeiten: {stand.bezeichnung}
			</h1>

			<StandForm mode="edit" stand={stand} standorte={standorte} />
		</>
	);
}
