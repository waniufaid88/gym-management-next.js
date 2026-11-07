"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Users,
  Clock,
  CircleUserRound,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "./logoutButton";

type SidebarProps = {
  userName: string;
  userEmail: string;
};

const links = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Members", href: "/members", icon: Users },
  { title: "Membership", href: "/membership", icon: CalendarDays },
  { title: "Shifts", href: "/shifts", icon: Clock },
  { title: "Payments", href: "/payments", icon: CreditCard },
];

export default function AppSidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
        <SidebarHeader className="h-16 justify-center border-b border-gray-200 px-3 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
          >
            <Dumbbell className="h-6 w-6 shrink-0 text-green-700" />

            <span className="whitespace-nowrap text-lg font-bold text-gray-950 group-data-[collapsible=icon]:hidden">
              GMS
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 group-data-[collapsible=icon]:hidden">
              Gym Management
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  const Icon = link.icon;

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
                        className={`
                          h-11 rounded-lg px-3 transition-colors
                          group-data-[collapsible=icon]:!justify-center
                          group-data-[collapsible=icon]:!px-2
                          ${
                            isActive
                              ? "bg-green-50 text-green-800 font-semibold hover:bg-green-100"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 shrink-0" />

                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {link.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-200 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  tooltip="My Account"
                  className="h-11 w-full rounded-lg px-3 text-gray-700 hover:bg-gray-100 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-2"
                />
              }
            >
              <CircleUserRound className="h-5 w-5 shrink-0 text-green-700" />

              <span className="min-w-0 flex-1 truncate text-left text-sm font-medium group-data-[collapsible=icon]:hidden">
                {userName}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuItem render={<Link href="/profile" />}>
                <CircleUserRound className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
