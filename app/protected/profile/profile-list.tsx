import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getProfile } from "@/lib/data/profil";

export async function ProfileList() {
	let profile: Awaited<ReturnType<typeof getProfile>>;
	try {
		profile = await getProfile();
	} catch (e) {
		return (
			<div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
				{e instanceof Error ? e.message : "Unbekannter Fehler"}
			</div>
		);
	}

	if (profile.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Noch keine Profile vorhanden.
			</p>
		);
	}

	// Bewusst ohne Löschen: tb_profil.id == auth.users.id (FK ON DELETE CASCADE),
	// ein Löschen würde den Auth-User mitentfernen.
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{profile.map((profil) => (
				<Card key={profil.id}>
					<CardHeader>
						<CardTitle>{profil.name}</CardTitle>
						<CardDescription>
							{profil.rolle} · {profil.aktiv ? "Aktiv" : "Inaktiv"}
						</CardDescription>
					</CardHeader>
					<CardFooter className="gap-2">
						<Link
							href={`/protected/profile/${profil.id}`}
							className={buttonVariants({ variant: "outline", size: "sm" })}
						>
							Bearbeiten
						</Link>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
