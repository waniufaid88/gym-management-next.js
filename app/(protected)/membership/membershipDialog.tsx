"use client";

import { useEffect, useState } from "react";
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

type MembershipDialogProps = {
  onSuccess: () => void;
};

const initialValues: MembershipFormValues = {
  memberId: "",
  startDate: new Date().toISOString().split("T")[0],
  durationMonths: "1",
  monthlyFee: 0,
};

export default function MembershipDialog({ onSuccess }: MembershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (!open) return;

    const fetchMembers = async () => {
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
    };

    fetchMembers();
  }, [open]);

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value && !form.formState.isSubmitting) {
      form.reset(initialValues);
    }
  }

  async function onSubmit(values: MembershipFormValues) {
    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create membership");
      }

      toast.success(data.message || "Membership created successfully");

      form.reset(initialValues);
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create membership",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Membership
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Membership</DialogTitle>
          <DialogDescription>
            Create a new membership for an existing gym member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Member</Label>

            <Select
              value={form.watch("memberId")}
              onValueChange={(value) => {
                form.setValue("memberId", value ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              disabled={loadingMembers || members.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a member">
                  {(() => {
                    const selectedMember = members.find(
                      (member) => member.id === form.watch("memberId"),
                    );

                    return selectedMember
                      ? `${selectedMember.name} - ${selectedMember.phone}`
                      : "Select a member";
                  })()}
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

            {form.formState.errors.memberId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.memberId.message}
              </p>
            )}

            {!loadingMembers && members.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No members available. Please add a member first.
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>

            <Input type="date" {...form.register("startDate")} />

            {form.formState.errors.startDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.startDate.message}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Membership Duration</Label>

            <Select
              value={form.watch("durationMonths")}
              onValueChange={(value) => {
                if (value) {
                  form.setValue(
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

            {form.formState.errors.durationMonths && (
              <p className="text-sm text-destructive">
                {form.formState.errors.durationMonths.message}
              </p>
            )}
          </div>

          {/* Monthly Fee */}
          <div className="space-y-2">
            <Label>Monthly Fee (₹)</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter monthly fee"
              {...form.register("monthlyFee", {
                valueAsNumber: true,
              })}
            />

            {form.formState.errors.monthlyFee && (
              <p className="text-sm text-destructive">
                {form.formState.errors.monthlyFee.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                loadingMembers ||
                members.length === 0
              }
            >
              {form.formState.isSubmitting
                ? "Creating..."
                : "Create Membership"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
