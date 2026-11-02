"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LogoutButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setOpen(false);
      toast.success("Logged out successfully");

      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <SidebarMenuButton
        type="button"
        tooltip="Logout"
        onClick={() => setOpen(true)}
      >
        <LogOut />
        <span>Logout</span>
      </SidebarMenuButton>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you really want to log out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
            disabled={loading}
          >
            {loading ? "Logging out..." : "Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
