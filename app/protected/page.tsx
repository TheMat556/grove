import Link from "next/link";
import { Suspense } from "react";
import { getSaisonSelection } from "@/lib/saison-context";

const links = [
	{ href: "/protected/saisons", label: "Saisons" },
	{ href: "/protected/standorte", label: "Standorte" },
	{ href: "/protected/staende", label: "Stände" },
	{ href: "/protected/produkte", label: "Produkte" },
	{ href: "/protected/kunden", label: "Kunden" },
	{ href: "/protected/profile", label: "Profile" },
];

export async function SaisonInfo() {
	let saisonName: string | undefined;
	try {
		const { saisons, selectedId } = await getSaisonSelection();
		saisonName = saisons.find((saison) => saison.id === selectedId)?.name;
	} catch {
		// Das Dashboard bleibt nutzbar, wenn die Saisons nicht laden.
	}

	if (!saisonName) return null;

	return (
		<p className="text-sm text-muted-foreground">
			Ausgewählte Saison: {saisonName}
		</p>
	);
}

export default function ProtectedPage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl">Grove Admin</h1>
				<Suspense fallback={null}>
					<SaisonInfo />
				</Suspense>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{links.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="border rounded-md p-4 hover:bg-accent text-sm font-medium"
					>
						{link.label}
					</Link>
				))}
			</div>
		</div>
	);
}
