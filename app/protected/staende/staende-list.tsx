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
import { getStaendeMitStandort } from "@/lib/data/stand";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { deleteStandAction } from "./actions";
import { StandDialog } from "./stand-dialog";

export async function StaendeList() {
	let staende: Awaited<ReturnType<typeof getStaendeMitStandort>>;
	try {
		staende = await getStaendeMitStandort();
	} catch (e) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{e instanceof Error ? e.message : "Unbekannter Fehler"}
				</AlertDescription>
			</Alert>
		);
	}

	if (staende.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Stände angelegt.
			</p>
		);
	}

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Bezeichnung</TableHead>
						<TableHead>PLZ</TableHead>
						<TableHead>Ort</TableHead>
						<TableHead>Adresse</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{staende.map((stand) => (
						<TableRow key={stand.id}>
							<TableCell className="font-medium">{stand.bezeichnung}</TableCell>
							<TableCell>{stand.standort?.plz ?? "–"}</TableCell>
							<TableCell>{stand.standort?.ort ?? "–"}</TableCell>
							<TableCell>{stand.standort?.adresse ?? "–"}</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<StandDialog
										mode="edit"
										stand={stand}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Stand bearbeiten"
											>
												<Pencil />
											</Button>
										}
									/>
									<ConfirmDeleteForm
										action={deleteStandAction}
										id={stand.id}
										entity="Stand"
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
