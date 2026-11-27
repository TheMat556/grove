"use client";

import {
	CalendarCheck,
	CalendarDays,
	Package,
	Plus,
	Receipt,
	Tag,
	TreePine,
	User,
	Users,
} from "lucide-react";
import { NeuLink } from "@/components/neu-link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EINTRAEGE = [
	{ titel: "Saison", href: "/protected/saisons", icon: CalendarDays },
	{ titel: "Stand", href: "/protected/staende", icon: TreePine },
	{ titel: "Produkt", href: "/protected/produkte", icon: Package },
	{ titel: "Kunde", href: "/protected/kunden", icon: Users },
	{ titel: "Verkauf", href: "/protected/verkaeufe", icon: Receipt },
	{
		titel: "Reservierung",
		href: "/protected/reservierungen",
		icon: CalendarCheck,
	},
	{
		titel: "Preisempfehlung",
		href: "/protected/preisempfehlungen",
		icon: Tag,
	},
	{ titel: "Profil", href: "/protected/profile", icon: User },
];

/**
 * Plus-Menü im App-Header: springt auf die Anlegen-Seiten der jeweiligen
 * Objekte (`?neu=1` öffnet dort direkt den Anlegen-Dialog).
 */
export function CreateMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Neu anlegen"
						title="Neu anlegen"
					/>
				}
			>
				<Plus className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-48">
				{EINTRAEGE.map(({ titel, href, icon: Icon }) => (
					<DropdownMenuItem
						key={titel}
						render={<NeuLink href={`${href}?neu=1`} />}
					>
						<Icon />
						{titel}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
