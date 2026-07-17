import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSaisons } from "@/lib/data/saison";

export async function SaisonsList() {
	let saisons: Awaited<ReturnType<typeof getSaisons>>;
	try {
		saisons = await getSaisons();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (saisons.length === 0) {
		return <p className="text-sm text-muted-foreground">Noch keine Saisons angelegt.</p>;
	}

	return (
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
	);
}
