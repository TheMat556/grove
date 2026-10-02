import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getStandort } from "@/lib/data/standort";
import { StandortForm } from "../standort-form";

export default function StandortEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Standort…</p>
				}
			>
				<StandortEdit params={params} />
			</Suspense>
		</div>
	);
}

async function StandortEdit({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const standort = await getStandort(id);

	if (!standort) {
		notFound();
	}

	return (
		<>
			<h1 className="font-bold text-2xl">
				Standort bearbeiten: {standort.plz} {standort.ort}
			</h1>

			<StandortForm mode="edit" standort={standort} />
		</>
	);
}
