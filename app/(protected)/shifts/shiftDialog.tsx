"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Shift = {
  id: string;
  startTime: string;
  endTime: string;
  membersCount?: number;
};

const shiftSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ShiftFormValues = z.infer<typeof shiftSchema>;

type ShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  onSuccess: () => void | Promise<void>;
};

export default function ShiftDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: ShiftDialogProps) {
  const isEditing = Boolean(shift);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (open && shift) {
      reset({
        startTime: shift.startTime.slice(0, 5),
        endTime: shift.endTime.slice(0, 5),
      });
    } else if (open) {
      reset({
        startTime: "",
        endTime: "",
      });
    }
  }, [open, shift, reset]);

  async function onSubmit(values: ShiftFormValues) {
    try {
      const response = await fetch(
        isEditing ? `/api/shifts/${shift?.id}` : "/api/shifts",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(values),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save shift");
      }

      toast.success(
        data.message ||
          (isEditing
            ? "Shift updated successfully"
            : "Shift created successfully"),
      );

      onOpenChange(false);
      await onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save shift",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Shift" : "Add Shift"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the shift timings."
              : "Set the start and end time for your new gym shift."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" {...register("startTime")} />
            {errors.startTime && (
              <p className="text-sm text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
            {errors.endTime && (
              <p className="text-sm text-destructive">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Shift"
                  : "Create Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
