"use client";

import {
	CalendarDays,
	LayoutDashboard,
	type LucideIcon,
	Package,
	TreePine,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
	title: string;
	url: string;
	icon: LucideIcon;
};

const items: NavItem[] = [
	{ title: "Dashboard", url: "/protected", icon: LayoutDashboard },
	{ title: "Saisons", url: "/protected/saisons", icon: CalendarDays },
	{ title: "Stände", url: "/protected/staende", icon: TreePine },
	{ title: "Produkte", url: "/protected/produkte", icon: Package },
	{ title: "Kunden", url: "/protected/kunden", icon: Users },
	{ title: "Profile", url: "/protected/profile", icon: User },
];

export function NavMain() {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarMenu className="gap-1">
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							tooltip={item.title}
							isActive={
								item.url === "/protected"
									? pathname === item.url
									: pathname.startsWith(item.url)
							}
							className="font-semibold text-muted-foreground data-active:font-semibold"
							render={<Link href={item.url} />}
						>
							<item.icon />
							<span>{item.title}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
