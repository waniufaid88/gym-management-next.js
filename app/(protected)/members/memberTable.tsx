"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function formatDate(date: string) {
  if (!date) return "-";

  const [year, month, day] = date.slice(0, 10).split("-");

  return `${day}/${month}/${year}`;
}

function formatTime(time: string) {
  if (!time) return "-";

  const [hours, minutes] = time.split(":").map(Number);

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function MemberTable() {
  const [members, setMembers] = useState<GymMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<GymMember | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [membersResponse, shiftsResponse] = await Promise.all([
          fetch("/api/members", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/shifts", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const membersData = await membersResponse.json();
        const shiftsData = await shiftsResponse.json();

        if (!membersResponse.ok) {
          throw new Error(membersData.message || "Could not load members");
        }

        if (!shiftsResponse.ok) {
          throw new Error(shiftsData.message || "Could not load shifts");
        }

        setMembers(membersData);
        setShifts(shiftsData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function fetchMembers() {
    try {
      const response = await fetch("/api/members", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load members");
      }

      setMembers(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load members",
      );
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

      setMembers((prev) =>
        prev.filter((item) => item.id !== deletingMember.id),
      );

      if (selectedMember?.id === deletingMember.id) {
        setSelectedMember(null);
      }

      toast.success("Member deleted successfully!");
      setDeletingMember(null);
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

          <MemberDialog shifts={shifts} onSaved={fetchMembers} />
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
                    <TableHead>Shift</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading members...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-destructive"
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>

                        <TableCell>{member.phone}</TableCell>

                        <TableCell>{member.gender}</TableCell>

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

                        <TableCell>{formatDate(member.created_at)}</TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View member"
                              onClick={() => setSelectedMember(member)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

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
                        colSpan={6}
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

      <Dialog
        open={!!selectedMember}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="mt-1 font-medium">{selectedMember.name}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{selectedMember.phone}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="mt-1 font-medium">{selectedMember.gender}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="mt-1 font-medium">
                  {formatDate(selectedMember.dob)}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-muted-foreground">Gym Shift</p>
                <p className="mt-1 font-medium">
                  {selectedMember.shift
                    ? `${formatTime(selectedMember.shift.startTime)} - ${formatTime(selectedMember.shift.endTime)}`
                    : "No shift assigned"}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-muted-foreground">Joined Date</p>
                <p className="mt-1 font-medium">
                  {formatDate(selectedMember.created_at)}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="mt-1 font-medium">{selectedMember.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {editingMember && (
        <MemberDialog
          key={editingMember.id}
          shifts={shifts}
          member={editingMember}
          onSaved={async () => {
            await fetchMembers();
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
