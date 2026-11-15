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
import { getProfile } from "@/lib/data/profil";
import { ProfilDialog } from "./profil-dialog";

/** Profilliste als Tabelle mit Bearbeiten-Dialog je Zeile. */
export async function ProfileList() {
	let profile: Awaited<ReturnType<typeof getProfile>>;
	try {
		profile = await getProfile();
	} catch (e) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{e instanceof Error ? e.message : "Unbekannter Fehler"}
				</AlertDescription>
			</Alert>
		);
	}

	if (profile.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Profile vorhanden.
			</p>
		);
	}

	// Bewusst ohne Anlegen und Löschen: tb_profil.id == auth.users.id.
	// Profile entstehen beim Sign-up (DB-Trigger), Löschen würde den Auth-User
	// mitentfernen (FK ON DELETE CASCADE).
	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Rolle</TableHead>
						<TableHead>Telefon</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Aktion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{profile.map((profil) => (
						<TableRow key={profil.id}>
							<TableCell className="font-medium">{profil.name}</TableCell>
							<TableCell>
								{profil.rolle === "admin" ? "Admin" : "Mitarbeitend"}
							</TableCell>
							<TableCell>{profil.telefon ?? "–"}</TableCell>
							<TableCell>{profil.aktiv ? "Aktiv" : "Inaktiv"}</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<ProfilDialog
										mode="edit"
										profil={profil}
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Profil bearbeiten"
											>
												<Pencil />
											</Button>
										}
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
