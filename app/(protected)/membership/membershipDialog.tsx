"use client";

import { useEffect, useState } from "react";
import {
  addDays,
  differenceInCalendarMonths,
  format,
  parseISO,
} from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const membershipSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  startDate: z.string().min(1, "Start date is required"),
  durationMonths: z.enum(["1", "3", "6", "12"]),
  monthlyFee: z.number().positive("Monthly fee must be greater than zero"),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

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

type MembershipDialogProps = {
  onSuccess: () => void | Promise<void>;
  membership?: Membership | null;
  onClose?: () => void;
};

const initialValues: MembershipFormValues = {
  memberId: "",
  startDate: format(new Date(), "yyyy-MM-dd"),
  durationMonths: "1",
  monthlyFee: 0,
};

function getDuration(startDate: string, endDate: string) {
  return differenceInCalendarMonths(
    addDays(parseISO(endDate), 1),
    parseISO(startDate),
  );
}

export default function MembershipDialog({
  onSuccess,
  membership,
  onClose,
}: MembershipDialogProps) {
  const isEditing = Boolean(membership);

  const [open, setOpen] = useState(isEditing);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: initialValues,
  });

  const selectedMemberId = watch("memberId");
  const selectedDuration = watch("durationMonths");

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  useEffect(() => {
    if (membership) {
      const duration = getDuration(membership.startDate, membership.endDate);

      reset({
        memberId: membership.memberId,
        startDate: membership.startDate.slice(0, 10),
        durationMonths: [1, 3, 6, 12].includes(duration)
          ? (String(duration) as MembershipFormValues["durationMonths"])
          : "1",
        monthlyFee: Number(membership.monthlyFee),
      });

      setOpen(true);
    } else {
      reset(initialValues);
      setOpen(false);
    }
  }, [membership, reset]);

  useEffect(() => {
    if (!open) return;

    async function fetchMembers() {
      try {
        setLoadingMembers(true);

        const response = await fetch("/api/members", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not fetch members");
        }

        const memberList = Array.isArray(data) ? data : (data.members ?? []);

        setMembers(memberList);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not fetch members",
        );
      } finally {
        setLoadingMembers(false);
      }
    }

    fetchMembers();
  }, [open]);

  function handleOpenChange(value: boolean) {
    if (isSubmitting) return;

    setOpen(value);

    if (!value) {
      reset(initialValues);

      if (isEditing) {
        onClose?.();
      }
    }
  }

  async function onSubmit(values: MembershipFormValues) {
    try {
      const response = await fetch(
        isEditing ? `/api/memberships/${membership!.id}` : "/api/memberships",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            memberId: values.memberId,
            startDate: values.startDate,
            durationMonths: Number(values.durationMonths),
            monthlyFee: values.monthlyFee,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Could not ${isEditing ? "update" : "create"} membership`,
        );
      }

      toast.success(
        data.message ||
          `Membership ${isEditing ? "updated" : "created"} successfully`,
      );

      reset(initialValues);
      setOpen(false);

      if (isEditing) {
        onClose?.();
      }

      await onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not ${isEditing ? "update" : "create"} membership`,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <DialogTrigger
          render={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Membership
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Membership" : "Add Membership"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the membership details."
              : "Create a new membership for an existing gym member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Member</Label>

            <Select
              value={selectedMemberId}
              onValueChange={(value) => {
                setValue("memberId", value ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              disabled={loadingMembers || members.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a member">
                  {selectedMember
                    ? `${selectedMember.name} - ${selectedMember.phone}`
                    : "Select a member"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.memberId && (
              <p className="text-sm text-destructive">
                {errors.memberId.message}
              </p>
            )}

            {!loadingMembers && members.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No members available. Please add a member first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>

            <Input type="date" {...register("startDate")} />

            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Membership Duration</Label>

            <Select
              value={selectedDuration}
              onValueChange={(value) => {
                if (value) {
                  setValue(
                    "durationMonths",
                    value as MembershipFormValues["durationMonths"],
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    },
                  );
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>

            {errors.durationMonths && (
              <p className="text-sm text-destructive">
                {errors.durationMonths.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Monthly Fee (₹)</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter monthly fee"
              {...register("monthlyFee", {
                valueAsNumber: true,
              })}
            />

            {errors.monthlyFee && (
              <p className="text-sm text-destructive">
                {errors.monthlyFee.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || loadingMembers || members.length === 0}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Membership"
                  : "Create Membership"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
