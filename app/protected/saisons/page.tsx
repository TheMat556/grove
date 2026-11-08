import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SaisonDialog } from "./saison-dialog";
import { SaisonsList } from "./saisons-list";

export default function SaisonsPage() {
	return (
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">Saisons</h1>
					<p className="text-sm text-muted-foreground">
						Saisons anlegen und bearbeiten. Aktiv ist die Saison, in deren
						Zeitraum heute liegt.
					</p>
				</div>

				<SaisonDialog
					mode="create"
					trigger={
						<Button>
							<Plus />
							Saison anlegen
						</Button>
					}
				/>
			</div>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Saisons…</p>
				}
			>
				<SaisonsList />
			</Suspense>
		</div>
	);
}
