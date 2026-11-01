"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
	saisons: "Saisons",
	standorte: "Standorte",
	staende: "Stände",
	produkte: "Produkte",
	kunden: "Kunden",
};

// Detail-Seiten (/protected/<entity>/<id>): übernehme den Entities-Namen.
function labelFor(segment: string, isLast: boolean) {
	if (labels[segment]) return labels[segment];
	return isLast ? "Details" : segment;
}

export function Breadcrumbs() {
	const pathname = usePathname();
	const relative = pathname.split("/").filter(Boolean).slice(1);
	const crumbs = relative.map((segment, index) => ({
		href: `/protected/${relative.slice(0, index + 1).join("/")}`,
		label: labelFor(segment, index === relative.length - 1),
	}));

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink render={<Link href="/protected" />}>
						Übersicht
					</BreadcrumbLink>
				</BreadcrumbItem>
				{crumbs.map((crumb, index) => (
					<BreadcrumbItem key={crumb.href}>
						<BreadcrumbSeparator className="[&[data-orientation=vertical]]:hidden" />
						{index === crumbs.length - 1 ? (
							<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
						) : (
							<BreadcrumbLink render={<Link href={crumb.href} />}>
								{crumb.label}
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
