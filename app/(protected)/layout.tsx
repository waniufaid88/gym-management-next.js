import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import AppSidebar from "@/components/appSidebar";
import { getCurrentUser } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
        </div>
      }
    >
      <Layout>{children}</Layout>
    </Suspense>
  );
}

async function Layout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar userName={currentUser.name} userEmail={currentUser.email} />

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="font-medium">Gym Management System</span>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
