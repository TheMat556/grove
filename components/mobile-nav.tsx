"use client";

import { Home, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, type NavItem } from "@/components/nav-main";
import { cn } from "@/lib/utils";

/**
 * Untere Navigation für Mobilgeräte: Start, Kunden und Verkäufe als Links,
 * Einstellungen nur als deaktivierter Platzhalter. Ab md übernimmt die Sidebar.
 */
export function MobileNav() {
	return (
		<nav
			aria-label="Hauptnavigation"
			className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
		>
			<div className="mx-auto grid max-w-md grid-cols-4">
				<NavLink title="Start" url="/protected" icon={Home} />
				<NavLink title="Kunden" url="/protected/kunden" icon={Users} />
				<NavLink title="Verkäufe" url="/protected/verkaeufe" icon={Receipt} />
				<span className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.7rem] text-muted-foreground opacity-50">
					<Settings className="size-5" />
					<span>Einstellungen</span>
				</span>
			</div>
		</nav>
	);
}

function NavLink({ title, url, icon: Icon }: NavItem) {
	const active = isActive(usePathname(), url);

	return (
		<Link
			href={url}
			aria-current={active ? "page" : undefined}
			className={cn(
				"flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.7rem] text-muted-foreground",
				active && "text-foreground",
			)}
		>
			<Icon className="size-5" />
			<span>{title}</span>
		</Link>
	);
}
