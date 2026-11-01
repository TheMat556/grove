import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getSaisons } from "@/lib/data/saison";
import { istAktiv } from "@/lib/saison";
import { SaisonDialog } from "./saison-dialog";

const dateFormat = new Intl.DateTimeFormat("de-DE");

function formatDate(value: string) {
	return dateFormat.format(new Date(value));
}

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
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Saisons angelegt.
			</p>
		);
	}

	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Start</TableHead>
						<TableHead>Ende</TableHead>
						<TableHead>Aktiv</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{saisons.map((saison) => (
						<TableRow key={saison.id}>
							<TableCell className="font-medium">{saison.name}</TableCell>
							<TableCell>{formatDate(saison.start_datum)}</TableCell>
							<TableCell>{formatDate(saison.end_datum)}</TableCell>
							<TableCell>
								{istAktiv(saison.start_datum, saison.end_datum) ? (
									<Badge>Aktiv</Badge>
								) : (
									<span className="text-muted-foreground">–</span>
								)}
							</TableCell>
							<TableCell className="text-right">
								<SaisonDialog
									mode="edit"
									saison={saison}
									trigger={
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Saison bearbeiten"
										>
											<Pencil />
										</Button>
									}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
