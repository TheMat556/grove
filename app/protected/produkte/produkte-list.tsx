import { Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getProdukte } from "@/lib/data/produkt";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { deleteProduktAction } from "./actions";
import { ProduktDialog } from "./produkt-dialog";

export async function ProdukteList() {
	let produkte: Awaited<ReturnType<typeof getProdukte>>;
	try {
		produkte = await getProdukte();
	} catch (e) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{e instanceof Error ? e.message : "Unbekannter Fehler"}
				</AlertDescription>
			</Alert>
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
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Bezeichnung</TableHead>
						<TableHead>Art</TableHead>
						<TableHead>Größe</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{produkte.map((produkt) => (
						<TableRow key={produkt.id}>
							<TableCell className="font-medium">
								{produkt.bezeichnung}
							</TableCell>
							<TableCell>{produkt.art}</TableCell>
							<TableCell>
								{produkt.von_cm}–{produkt.bis_cm} cm
							</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<ProduktDialog
										mode="edit"
										produkt={produkt}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Produkt bearbeiten"
											>
												<Pencil />
											</Button>
										}
									/>
									<ConfirmDeleteForm
										action={deleteProduktAction}
										id={produkt.id}
										entity="Produkt"
									/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
