import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getStaende } from "@/lib/data/stand";
import { getStandorte } from "@/lib/data/standort";
import { deleteStandAction } from "./actions";

export async function StaendeList() {
	let staende: Awaited<ReturnType<typeof getStaende>>;
	try {
		staende = await getStaende();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (staende.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Stände angelegt.
			</p>
		);
	}

	const standorte = await getStandorte();
	const standortByStand = new Map(standorte.map((s) => [s.id, s]));

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{staende.map((stand) => {
				const standort = standortByStand.get(stand.standort_id);
				return (
					<Card key={stand.id}>
						<CardHeader>
							<CardTitle>{stand.bezeichnung}</CardTitle>
							<CardDescription>
								{standort ? `${standort.plz} ${standort.ort}` : "–"}
							</CardDescription>
						</CardHeader>
						<CardFooter className="gap-2">
							<Link
								href={`/protected/staende/${stand.id}`}
								className={buttonVariants({ variant: "outline", size: "sm" })}
							>
								Bearbeiten
							</Link>
							<form action={deleteStandAction}>
								<input type="hidden" name="id" value={stand.id} />
								<Button variant="outline" size="sm" type="submit">
									Löschen
								</Button>
							</form>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
