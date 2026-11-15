import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ProfilDialog } from "./profil-dialog";
import { ProfileList } from "./profile-list";

export default function ProfilePage() {
	return (
		<div className="flex flex-1 w-full flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl">Profile</h1>
					<p className="text-sm text-muted-foreground">
						Konten anlegen; Name, Telefon und Aktiv-Status hier pflegen.
					</p>
				</div>

				<ProfilDialog
					mode="create"
					trigger={
						<Button>
							<Plus />
							Profil anlegen
						</Button>
					}
				/>
			</div>

			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Lade Profile…</p>
				}
			>
				<ProfileList />
			</Suspense>
		</div>
	);
}
