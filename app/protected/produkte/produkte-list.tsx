import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getProdukte } from "@/lib/data/produkt";
import { deleteProduktAction } from "./actions";

export async function ProdukteList() {
	let produkte: Awaited<ReturnType<typeof getProdukte>>;
	try {
		produkte = await getProdukte();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (produkte.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Produkte angelegt.
			</p>
		);
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{produkte.map((produkt) => (
				<Card key={produkt.id}>
					<CardHeader>
						<CardTitle>{produkt.bezeichnung}</CardTitle>
						<CardDescription>
							{produkt.art} · {produkt.von_cm}–{produkt.bis_cm} cm
						</CardDescription>
					</CardHeader>
					<CardFooter className="gap-2">
						<Link
							href={`/protected/produkte/${produkt.id}`}
							className={buttonVariants({ variant: "outline", size: "sm" })}
						>
							Bearbeiten
						</Link>
						<form action={deleteProduktAction}>
							<input type="hidden" name="id" value={produkt.id} />
							<Button variant="outline" size="sm" type="submit">
								Löschen
							</Button>
						</form>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
