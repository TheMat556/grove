"use client";

import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";

type NavUserProps = {
	user: { id: string; name: string; email: string };
};

function initials(user: NavUserProps["user"]) {
	return (user.name || user.email || "?")
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function NavUser({ user }: NavUserProps) {
	const router = useRouter();
	const { isMobile } = useSidebar();

	const signOut = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/auth/login");
	};

	return (
		<>
			<SidebarMenu className="gap-1">
				<SidebarMenuItem>
					<SidebarMenuButton
						className="font-semibold"
						render={<button type="button" onClick={signOut} />}
					>
						<LogOut />
						<span>Logout</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton
						className="font-semibold"
						render={<Link href="/protected/settings" />}
					>
						<Settings />
						<span>Settings</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton
						className="font-semibold"
						render={<Link href={`/protected/profile/${user.id}`} />}
					>
						<UserRound />
						<span>Profil</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
			<Separator className="my-1" />
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								/>
							}
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg">
									{initials(user)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="rounded-lg">
											{initials(user)}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuItem
								render={<Link href={`/protected/profile/${user.id}`} />}
							>
								<UserRound />
								Profil
							</DropdownMenuItem>
							<DropdownMenuItem render={<Link href="/protected/settings" />}>
								<Settings />
								Einstellungen
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								render={<button type="button" onClick={signOut} />}
							>
								<LogOut />
								Abmelden
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
