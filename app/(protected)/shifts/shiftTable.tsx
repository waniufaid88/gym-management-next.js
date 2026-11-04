"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

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

import ShiftDialog, { type Shift } from "./shiftDialog";

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

type ShiftTableProps = { initialShifts: Shift[] };

export default function ShiftTable({ initialShifts }: ShiftTableProps) {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchShifts() {
    router.refresh();
  }

  useEffect(() => {
    setShifts(initialShifts);
  }, [initialShifts]);

  function openAddDialog() {
    setEditingShift(null);
    setDialogOpen(true);
  }

  function openEditDialog(shift: Shift) {
    setEditingShift(shift);
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setEditingShift(null);
    }
  }

  async function deleteShift(id: string) {
    try {
      setDeletingId(id);

      const response = await fetch(`/api/shifts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete shift");
      }

      setShifts((previous) => previous.filter((shift) => shift.id !== id));
      router.refresh();

      toast.success(data.message || "Shift deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete shift",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shifts</h1>
          <p className="text-sm text-muted-foreground">
            Manage gym timings and member shift assignments.
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Assigned Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading shifts...
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No shifts available. Add your first shift.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {formatTime(shift.startTime)}
                  </TableCell>

                  <TableCell>{formatTime(shift.endTime)}</TableCell>

                  <TableCell>{shift.membersCount ?? 0}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Edit shift"
                        onClick={() => openEditDialog(shift)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon"
                              title={
                                shift.membersCount && shift.membersCount > 0
                                  ? "Cannot delete a shift with assigned members"
                                  : "Delete shift"
                              }
                              disabled={
                                deletingId === shift.id ||
                                (shift.membersCount ?? 0) > 0
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                        />

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Shift?</AlertDialogTitle>

                            <AlertDialogDescription>
                              Are you sure you want to delete the shift from{" "}
                              <span className="font-semibold">
                                {formatTime(shift.startTime)}
                              </span>{" "}
                              to{" "}
                              <span className="font-semibold">
                                {formatTime(shift.endTime)}
                              </span>
                              ? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => deleteShift(shift.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        shift={editingShift}
        onSuccess={fetchShifts}
      />
    </div>
  );
}
