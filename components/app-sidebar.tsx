"use client";

import Link from "next/link";
import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LogoutButton from "@/components/logout-button";

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
  const [profileOpen, setProfileOpen] = useState(false);

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
                      className={`h-10 rounded-lg px-3 text-sm transition-colors ${
                        isActive
                          ? "bg-gray-200 text-gray-950 font-semibold shadow-sm hover:bg-gray-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{link.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton className="h-auto w-full cursor-pointer justify-start gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-green-800 dark:text-green-300" />
            }
          >
            <CircleUserRound className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {userName}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <CircleUserRound className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <DialogDescription>Your account details.</DialogDescription>
            </DialogHeader>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd>{userName}</dd>
              </div>

              <div>
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd>{userEmail}</dd>
              </div>
            </dl>

            <DialogFooter>
              <LogoutButton />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
