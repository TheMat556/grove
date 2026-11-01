import { CalendarPlus, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SaisonSwitcher } from "@/components/saison-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider className="h-svh overflow-hidden">
			<Suspense>
				<AppSidebar />
			</Suspense>
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 bg-transparent">
					<div className="flex w-full items-center gap-1 px-3 lg:gap-2 lg:px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-6"
						/>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button variant="ghost" size="icon-sm" aria-label="Neu" />
								}
							>
								<Plus className="size-4" aria-hidden="true" />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem
									render={<Link href="/protected/reservierungen" />}
								>
									<CalendarPlus />
									Reservierung
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<div className="ml-auto flex items-center gap-2">
							<Suspense fallback={<Skeleton className="h-7 w-36 sm:w-44" />}>
								<SaisonSwitcher />
							</Suspense>
							<ThemeSwitcher />
						</div>
					</div>
				</header>
				<div
					className={cn(
						"flex min-h-0 flex-1 flex-col rounded-xl bg-background p-4 pb-28 shadow-sm md:mx-2 md:mb-2 md:pb-4 max-md:mx-0 max-md:mb-0 max-md:rounded-b-none max-md:shadow-none",
					)}
				>
					{children}
				</div>
			</SidebarInset>
			<MobileNav />
		</SidebarProvider>
	);
}
