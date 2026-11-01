"use client";

import {
	CalendarDays,
	CirclePlus,
	House,
	type LucideIcon,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items: { label: string; url: string; icon: LucideIcon }[] = [
	{ label: "Start", url: "/protected", icon: House },
	{ label: "Saisons", url: "/protected/saisons", icon: CalendarDays },
	{ label: "Neu", url: "/protected/reservierungen", icon: CirclePlus },
	{ label: "Kunden", url: "/protected/kunden", icon: Users },
	{ label: "Profil", url: "/protected/profile", icon: User },
];

export function MobileNav() {
	const pathname = usePathname();

	return (
		<div className="fixed inset-x-0 bottom-0 z-30 border-border/60 border-t bg-background px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
			<nav className="flex items-end" aria-label="Primary navigation">
				{items.map((item) => {
					const active =
						item.url === "/protected"
							? pathname === item.url
							: pathname.startsWith(item.url);
					const Icon = item.icon;

					return (
						<Link
							key={item.url}
							href={item.url}
							aria-current={active ? "page" : undefined}
							className="relative flex flex-1 flex-col items-center gap-1 px-2 pt-2 pb-3 transition-colors"
						>
							<Icon
								className={cn(
									"size-6",
									active ? "text-foreground" : "text-muted-foreground",
								)}
								aria-hidden="true"
							/>
							<span
								className={cn(
									"font-medium text-[10px] leading-none",
									active ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{item.label}
							</span>
							<span
								className={cn(
									"absolute bottom-0 h-0.5 w-6 rounded-full",
									active ? "bg-foreground" : "bg-transparent",
								)}
								aria-hidden="true"
							/>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
