"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  differenceInCalendarMonths,
  format,
  parseISO,
} from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { SearchForm } from "@/components/searchForm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MembershipDialog from "./membershipDialog";

type GymMember = {
  id: string;
  name: string;
  phone: string;
};

type Membership = {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  monthlyFee: string;
  member: GymMember;
};

type MembershipTableProps = {
  initialMemberships: Membership[];
  search: string;
};

type MembershipStatus = "active" | "expired" | "upcoming";

function getMembershipStatus(
  startDate: string,
  endDate: string,
): MembershipStatus {
  const today = format(new Date(), "yyyy-MM-dd");

  if (startDate > today) return "upcoming";
  if (endDate < today) return "expired";

  return "active";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return format(parseISO(date), "dd/MM/yyyy");
}

function getDuration(startDate: string, endDate: string) {
  return differenceInCalendarMonths(
    addDays(parseISO(endDate), 1),
    parseISO(startDate),
  );
}

export default function MembershipTable({
  initialMemberships,
  search,
}: MembershipTableProps) {
  const router = useRouter();
  const [memberships, setMemberships] =
    useState<Membership[]>(initialMemberships);
  const [loading] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchMemberships() {
    router.refresh();
  }

  useEffect(() => {
    setMemberships(initialMemberships);
  }, [initialMemberships]);

  async function deleteMembership(id: string) {
    try {
      setDeletingId(id);

      const response = await fetch(`/api/memberships/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete membership");
      }

      setMemberships((prev) =>
        prev.filter((membership) => membership.id !== id),
      );
      router.refresh();

      toast.success(data.message || "Membership deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete membership",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Memberships</h1>
          <p className="text-sm text-muted-foreground">
            Manage gym memberships and track their validity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SearchForm
            initialValue={search}
            placeholder="Search memberships by name or phone"
            debounce={500}
          />
          <MembershipDialog onSuccess={fetchMemberships} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading memberships...
                </TableCell>
              </TableRow>
            ) : memberships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No memberships available. Add your first membership.
                </TableCell>
              </TableRow>
            ) : (
              memberships.map((membership) => {
                const duration = getDuration(
                  membership.startDate,
                  membership.endDate,
                );
                const monthlyFee = Number(membership.monthlyFee);
                const status = getMembershipStatus(
                  membership.startDate,
                  membership.endDate,
                );

                return (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium">
                      {membership.member?.name ?? "Unknown"}
                    </TableCell>

                    <TableCell>{membership.member?.phone ?? "-"}</TableCell>

                    <TableCell>{formatDate(membership.startDate)}</TableCell>
                    <TableCell>{formatDate(membership.endDate)}</TableCell>

                    <TableCell>
                      {duration} {duration === 1 ? "Month" : "Months"}
                    </TableCell>

                    <TableCell>{formatCurrency(monthlyFee)}</TableCell>

                    <TableCell className="font-medium">
                      {formatCurrency(monthlyFee * duration)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={status === "active" ? "default" : "secondary"}
                        className={
                          status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : status === "expired"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit membership"
                          onClick={() => setEditingMembership(membership)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="outline"
                                size="icon"
                                title="Delete membership"
                                disabled={deletingId === membership.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            }
                          />

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Membership?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete the membership
                                for{" "}
                                <span className="font-semibold">
                                  {membership.member?.name}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => deleteMembership(membership.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingMembership && (
        <MembershipDialog
          membership={editingMembership}
          onClose={() => setEditingMembership(null)}
          onSuccess={fetchMemberships}
        />
      )}
    </div>
  );
}
