import { Suspense } from "react";
import { ProfileList } from "./profile-list";

export default function ProfilePage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Profile</h1>

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
