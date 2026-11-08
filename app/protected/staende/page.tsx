import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { StaendeList } from "./staende-list";
import { StandDialog } from "./stand-dialog";

export default function StaendePage() {
	return (
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">Stände</h1>
					<p className="text-sm text-muted-foreground">
						Stände mit ihrem Standort anlegen und bearbeiten.
					</p>
				</div>

				<StandDialog
					mode="create"
					trigger={
						<Button>
							<Plus />
							Stand anlegen
						</Button>
					}
				/>
			</div>

			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Lade Stände…</p>}
			>
				<StaendeList />
			</Suspense>
		</div>
	);
}
