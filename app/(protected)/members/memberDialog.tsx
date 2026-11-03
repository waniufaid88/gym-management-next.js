"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Shift = {
  id: string;
  startTime: string;
  endTime: string;
};

export type GymMember = {
  id: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  shiftId: string | null;
  shift: Shift | null;
  created_at: string;
};

const memberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Phone must be at least 10 characters"),
  address: z.string().trim().min(3, "Please enter an address"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  shiftId: z.string().min(1, "Please select a shift"),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

type MemberDialogProps = {
  shifts: Shift[];
  member?: GymMember | null;
  onSaved: () => void | Promise<void>;
  onClose?: () => void;
};

const emptyValues: MemberFormValues = {
  name: "",
  phone: "",
  address: "",
  dob: "",
  gender: "Male",
  shiftId: "",
};

export default function MemberDialog({
  shifts,
  member,
  onSaved,
  onClose,
}: MemberDialogProps) {
  const isEditing = Boolean(member);

  const [open, setOpen] = useState(isEditing);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: emptyValues,
  });

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value && isEditing) {
      onClose?.();
    }

    if (value) {
      reset(
        member
          ? {
              name: member.name,
              phone: member.phone,
              address: member.address,
              dob: member.dob?.slice(0, 10) ?? "",
              gender: member.gender,
              shiftId: member.shiftId ?? member.shift?.id ?? "",
            }
          : emptyValues,
      );
    }
  }

  async function onSubmit(data: MemberFormValues) {
    try {
      setLoading(true);

      const response = await fetch(
        isEditing ? `/api/members/${member!.id}` : "/api/members",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(
        isEditing
          ? "Member updated successfully!"
          : "Member added successfully!",
      );

      await onSaved();

      reset(emptyValues);
      setOpen(false);

      if (isEditing) {
        onClose?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!member && (
        <DialogTrigger>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Member" : "Add New Member"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the member details below."
              : "Enter the member details below to add a new gym member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter member name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {errors.dob && (
                <p className="text-sm text-destructive">{errors.dob.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                {...register("gender")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {errors.gender && (
                <p className="text-sm text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftId">Gym Shift</Label>
            <select
              id="shiftId"
              {...register("shiftId")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Select a shift</option>

              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                </option>
              ))}
            </select>

            {errors.shiftId && (
              <p className="text-sm text-destructive">
                {errors.shiftId.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isEditing
                  ? "Update Member"
                  : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
