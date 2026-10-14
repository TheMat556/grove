import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProfil } from "@/lib/data/profil";
import { ProfilForm } from "../profil-form";

export default function ProfilEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Profil…</p>}
			>
				<ProfilEdit params={params} />
			</Suspense>
		</div>
	);
}

async function ProfilEdit({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const profil = await getProfil(id);

	if (!profil) {
		notFound();
	}

	return (
		<>
			<h1 className="font-bold text-2xl">Profil bearbeiten: {profil.name}</h1>

			<ProfilForm profil={profil} />
		</>
	);
}
