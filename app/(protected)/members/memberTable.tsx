"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "react-hot-toast";
import { format, parseISO, differenceInYears } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MemberDialog from "./memberDialog";
import type { GymMember, Shift } from "./memberDialog";
import { SearchForm } from "@/components/searchForm";

type MemberTableProps = {
  initialMembers: GymMember[];
  search: string;
};

function formatDate(date: string) {
  if (!date) return "-";

  return format(parseISO(date.slice(0, 10)), "dd/MM/yyyy");
}

function formatTime(time: string) {
  if (!time) return "-";

  return format(parseISO(`2000-01-01T${time}`), "hh:mm a");
}

function calculateAge(dob: string) {
  if (!dob) return "-";

  const birthDate = parseISO(dob);

  return differenceInYears(new Date(), birthDate);
}

export default function MemberTable({
  initialMembers,
  search,
}: MemberTableProps) {
  const router = useRouter();

  const [members, setMembers] = useState<GymMember[]>(initialMembers);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<GymMember | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const response = await fetch("/api/shifts", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load shifts");
        }

        setShifts(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not load shifts",
        );
      }
    }

    fetchShifts();
  }, []);

  function fetchMembers() {
    router.refresh();
  }

  async function toggleMemberStatus(member: GymMember) {
    const newStatus = member.status === "active" ? "inactive" : "active";

    try {
      setUpdatingStatusId(member.id);

      const response = await fetch(`/api/members/${member.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update member status");
      }

      setMembers((prev) =>
        prev.map((item) =>
          item.id === member.id ? { ...item, status: newStatus } : item,
        ),
      );

      toast.success(data.message || "Member status updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update member status",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function deleteMember() {
    if (!deletingMember) return;

    try {
      setDeletingId(deletingMember.id);

      const response = await fetch(`/api/members/${deletingMember.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete member");
      }

      toast.success("Member deleted successfully!");

      setDeletingMember(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete member",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Members</h1>

            <p className="text-sm text-muted-foreground">
              Manage your gym members and their details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchForm
              initialValue={search}
              placeholder="Search members by name or phone"
            />

            <MemberDialog shifts={shifts} onSaved={fetchMembers} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member List</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>

                        <TableCell>{member.phone}</TableCell>

                        <TableCell>{member.gender}</TableCell>

                        <TableCell>{calculateAge(member.dob)}</TableCell>

                        <TableCell>
                          {member.shift ? (
                            <Badge variant="secondary">
                              {formatTime(member.shift.startTime)} -{" "}
                              {formatTime(member.shift.endTime)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              No shift
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell>{formatDate(member.created_at)}</TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit member"
                              onClick={() => setEditingMember(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title={
                                member.status === "active"
                                  ? "Deactivate member"
                                  : "Activate member"
                              }
                              disabled={updatingStatusId !== null}
                              onClick={() => toggleMemberStatus(member)}
                            >
                              {member.status === "active" ? (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              ) : (
                                <UserX className="h-4 w-4 text-destructive" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete member"
                              disabled={deletingId === member.id}
                              onClick={() => setDeletingMember(member)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No members added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingMember && (
        <MemberDialog
          key={editingMember.id}
          shifts={shifts}
          member={editingMember}
          onSaved={() => {
            fetchMembers();
            setEditingMember(null);
          }}
          onClose={() => setEditingMember(null)}
        />
      )}

      <AlertDialog
        open={!!deletingMember}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setDeletingMember(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {deletingMember?.name}
              </span>{" "}
              from your gym members.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={!!deletingId}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                deleteMember();
              }}
            >
              {deletingId ? "Deleting..." : "Delete Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
