import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getKunden } from "@/lib/data/kunde";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { deleteKundeAction } from "./actions";

export async function KundenList() {
	let kunden: Awaited<ReturnType<typeof getKunden>>;
	try {
		kunden = await getKunden();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (kunden.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Kunden angelegt.
			</p>
		);
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{kunden.map((kunde) => (
				<Card key={kunde.id}>
					<CardHeader>
						<CardTitle>{kunde.name}</CardTitle>
						<CardDescription>
							{kunde.ist_firma ? "Firma" : "Privat"} · {kunde.telefon}
						</CardDescription>
					</CardHeader>
					<CardFooter className="gap-2">
						<Link
							href={`/protected/kunden/${kunde.id}`}
							className={buttonVariants({ variant: "outline", size: "sm" })}
						>
							Bearbeiten
						</Link>
						<ConfirmDeleteForm
							action={deleteKundeAction}
							id={kunde.id}
							entity="Kunde"
						/>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
