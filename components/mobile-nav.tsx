"use client";

import { Home, Plus, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, type NavItem } from "@/components/nav-main";
import { NeuLink } from "@/components/neu-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Untere Navigation für Mobilgeräte: Start, Kunden, zentraler Anlegen-Button,
 * Verkäufe und Einstellungen. Ab md übernimmt die Sidebar.
 */
export function MobileNav() {
	return (
		<nav
			aria-label="Hauptnavigation"
			className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
		>
			<div className="mx-auto grid max-w-md grid-cols-5">
				<NavLink title="Start" url="/protected" icon={Home} />
				<NavLink title="Kunden" url="/protected/kunden" icon={Users} />
				<div className="flex min-h-14 items-center justify-center">
					<NeuLink
						href="/protected/verkaeufe?neu=1"
						aria-label="Verkauf erfassen"
						title="Verkauf erfassen"
						className={cn(
							buttonVariants({ size: "icon" }),
							"size-10 rounded-xl shadow-sm",
						)}
					>
						<Plus className="size-5" />
					</NeuLink>
				</div>
				<NavLink title="Verkäufe" url="/protected/verkaeufe" icon={Receipt} />
				<NavLink
					title="Einstellungen"
					url="/protected/einstellungen"
					icon={Settings}
				/>
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
