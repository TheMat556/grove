"use client";

import { Home, Plus, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isActive, type NavItem } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Untere Navigation für Mobilgeräte: zwei Links, in der Mitte der
 * (noch inaktive) Verkauf-Button, rechts zwei weitere Punkte. Ab md bleibt
 * die Sidebar die Navigation.
 */
export function MobileNav() {
	const [comingSoon, setComingSoon] = useState<string | null>(null);

	return (
		<>
			<nav
				aria-label="Hauptnavigation"
				className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
			>
				<div className="mx-auto grid max-w-md grid-cols-5">
					<NavLink title="Start" url="/protected" icon={Home} />
					<NavLink title="Kunden" url="/protected/kunden" icon={Users} />

					<div className="flex min-h-14 items-center justify-center">
						<Button
							type="button"
							aria-label="Verkauf erfassen"
							className="size-10 rounded-xl"
							onClick={() => setComingSoon("Verkauf erfassen")}
						>
							<Plus className="size-5" />
						</Button>
					</div>

					<NavLink title="Verkäufe" url="/protected/verkaeufe" icon={Receipt} />

					<button
						type="button"
						className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.7rem] text-muted-foreground"
						onClick={() => setComingSoon("Einstellungen")}
					>
						<Settings className="size-5" />
						<span>Einstellungen</span>
					</button>
				</div>
			</nav>

			<Sheet
				open={comingSoon !== null}
				onOpenChange={(open) => {
					if (!open) setComingSoon(null);
				}}
			>
				<SheetContent
					side="bottom"
					className="pb-[calc(env(safe-area-inset-bottom)+1rem)]"
				>
					<SheetHeader>
						<SheetTitle>{comingSoon}</SheetTitle>
						<SheetDescription>
							Dieser Bereich ist noch in Arbeit.
						</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</>
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
