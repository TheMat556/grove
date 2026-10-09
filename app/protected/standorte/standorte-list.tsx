import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getStandorte } from "@/lib/data/standort";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { deleteStandortAction } from "./actions";

export async function StandorteList() {
	let standorte: Awaited<ReturnType<typeof getStandorte>>;
	try {
		standorte = await getStandorte();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (standorte.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Standorte angelegt.
			</p>
		);
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{standorte.map((standort) => (
				<Card key={standort.id}>
					<CardHeader>
						<CardTitle>
							{standort.plz} {standort.ort}
						</CardTitle>
						<CardDescription>{standort.adresse}</CardDescription>
					</CardHeader>
					<CardFooter className="gap-2">
						<Link
							href={`/protected/standorte/${standort.id}`}
							className={buttonVariants({ variant: "outline", size: "sm" })}
						>
							Bearbeiten
						</Link>
						<ConfirmDeleteForm
							action={deleteStandortAction}
							id={standort.id}
							entity="Standort"
						/>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
