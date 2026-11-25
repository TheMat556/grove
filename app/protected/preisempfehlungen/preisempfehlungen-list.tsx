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
import { getPreisempfehlungenBySaisonId } from "@/lib/data/preisempfehlung";
import { ConfirmDeleteForm } from "../_crud/confirm-delete-form";
import { euroFormat } from "../verkaeufe/format";
import { deletePreisempfehlungAction } from "./actions";
import { PreisempfehlungDialog } from "./preisempfehlung-dialog";

/** Preisempfehlungen der gewählten Saison mit Produktname. */
export async function PreisempfehlungenList({
	saisonId,
	produkte,
}: {
	saisonId: string;
	produkte: Array<{ id: string; art: string; bezeichnung: string }>;
}) {
	const empfehlungen = await getPreisempfehlungenBySaisonId(saisonId);

	if (empfehlungen.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Preisempfehlungen in dieser Saison.
			</p>
		);
	}

	const produktById = new Map(produkte.map((produkt) => [produkt.id, produkt]));

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Produkt</TableHead>
						<TableHead>Art</TableHead>
						<TableHead className="text-right">Preis</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{empfehlungen.map((empfehlung) => {
						const produkt = produktById.get(empfehlung.produkt_id);

						return (
							<TableRow key={empfehlung.id}>
								<TableCell className="font-medium">
									{produkt?.bezeichnung ?? "–"}
								</TableCell>
								<TableCell>{produkt?.art ?? "–"}</TableCell>
								<TableCell className="text-right whitespace-nowrap">
									{euroFormat.format(empfehlung.preis)}
								</TableCell>
								<TableCell>
									<div className="flex justify-end gap-2">
										<PreisempfehlungDialog
											mode="edit"
											saisonId={saisonId}
											produkte={produkte}
											empfehlung={empfehlung}
											trigger={
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label="Preisempfehlung bearbeiten"
												>
													<Pencil />
												</Button>
											}
										/>
										<ConfirmDeleteForm
											action={deletePreisempfehlungAction}
											id={empfehlung.id}
											entity="Preisempfehlung"
										/>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
