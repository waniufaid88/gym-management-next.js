"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Users,
  History,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import LogoutButton from "@/components/logout-button";

const links = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Members", href: "/members", icon: Users },
  { title: "Membership", href: "/membership", icon: CalendarDays },
  { title: "Shifts", href: "/shifts", icon: Clock },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "History", href: "/history", icon: History },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-green-700" />
          <span className="text-lg font-bold tracking-tight text-gray-950">
            GMS
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-1 px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Gym management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {links.map((link) =>
                (() => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={link.href}
                            aria-current={isActive ? "page" : undefined}
                          />
                        }
                        isActive={isActive}
                        tooltip={link.title}
                        className={`h-10 rounded-lg px-3 text-sm transition-colors ${isActive ? "bg-gray-200 text-gray-950 font-semibold shadow-sm hover:bg-gray-200" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        <span>{link.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })(),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
