import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getKunden } from "@/lib/data/kunde";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { deleteKundeAction } from "./actions";
import { KundeDialog } from "./kunde-dialog";

/** Kundenliste als Tabelle mit Bearbeiten-Dialog und Löschen je Zeile. */
export async function KundenList() {
	const kunden = await getKunden();

	if (kunden.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Kunden angelegt.
			</p>
		);
	}

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Typ</TableHead>
						<TableHead>Telefon</TableHead>
						<TableHead>PLZ</TableHead>
						<TableHead>Adresse</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{kunden.map((kunde) => (
						<TableRow key={kunde.id}>
							<TableCell className="font-medium">{kunde.name}</TableCell>
							<TableCell>{kunde.ist_firma ? "Firma" : "Privat"}</TableCell>
							<TableCell>{kunde.telefon}</TableCell>
							<TableCell>{kunde.plz || "–"}</TableCell>
							<TableCell>{kunde.adresse}</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<KundeDialog
										mode="edit"
										kunde={kunde}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Kunde bearbeiten"
											>
												<Pencil />
											</Button>
										}
									/>
									<ConfirmDeleteForm
										action={deleteKundeAction}
										id={kunde.id}
										entity="Kunde"
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
