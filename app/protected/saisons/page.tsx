import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSaisons } from "@/lib/data/saison";
import type { Saison } from "@/lib/schemas/saison";
import { SaisonForm } from "./saison-form";

export default async function SaisonsPage() {
	let saisons: Saison[] = [];
	let fehler: string | null = null;

	try {
		saisons = await getSaisons();
	} catch (e) {
		fehler = e instanceof Error ? e.message : "Unbekannter Fehler";
	}

	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Saisons</h1>

			<SaisonForm />

			{fehler && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
					{fehler}
				</div>
			)}

			{!fehler && saisons.length === 0 && (
				<p className="text-sm text-muted-foreground">Noch keine Saisons angelegt.</p>
			)}

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{saisons.map((saison) => (
					<Card key={saison.id}>
						<CardHeader>
							<CardTitle>{saison.name}</CardTitle>
							<CardDescription>
								{saison.start_datum} &ndash; {saison.end_datum}
							</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
