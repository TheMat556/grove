import Link from "next/link";

const links = [
	{ href: "/protected/saisons", label: "Saisons" },
	{ href: "/protected/standorte", label: "Standorte" },
	{ href: "/protected/staende", label: "Stände" },
	{ href: "/protected/produkte", label: "Produkte" },
	{ href: "/protected/kunden", label: "Kunden" },
	{ href: "/protected/profile", label: "Profile" },
];

export default function ProtectedPage() {
	return (
		<div className="flex-1 w-full flex flex-col gap-6">
			<h1 className="font-bold text-2xl">Grove Admin</h1>
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
