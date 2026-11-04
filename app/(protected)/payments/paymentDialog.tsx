"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, subDays } from "date-fns";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const paymentSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  membershipId: z.string().min(1, "Please select a membership"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .transform(Number)
    .refine(
      (value) => Number.isFinite(value) && value > 0,
      "Amount must be greater than zero",
    ),
  paymentMode: z.string().min(1, "Please select a payment mode"),
  paymentDate: z.string().min(1, "Please select a payment date"),
});

type PaymentFormValues = z.output<typeof paymentSchema>;

type Member = {
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
};

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export default function PaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: PaymentDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);

  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("1");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [savingMembership, setSavingMembership] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof paymentSchema>, undefined, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: "",
      membershipId: "",
      amount: "",
      paymentMode: "",
      paymentDate: "",
    },
  });

  const selectedMemberId = watch("memberId");
  const selectedMembershipId = watch("membershipId");

  const filteredMemberships = memberships.filter(
    (membership) => membership.memberId === selectedMemberId,
  );

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  const selectedMembership = memberships.find(
    (membership) => membership.id === selectedMembershipId,
  );

  const hasNoMembership =
    selectedMemberId !== "" && filteredMemberships.length === 0;

  useEffect(() => {
    if (open) {
      setValue("paymentDate", format(new Date(), "yyyy-MM-dd"));
    }
  }, [open, setValue]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [membersResponse, membershipsResponse] = await Promise.all([
          fetch("/api/members", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/memberships", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!membersResponse.ok || !membershipsResponse.ok) {
          throw new Error("Could not load members or memberships");
        }

        const membersData = await membersResponse.json();
        const membershipsData = await membershipsResponse.json();

        setMembers(
          Array.isArray(membersData)
            ? membersData
            : (membersData.members ?? []),
        );

        setMemberships(
          Array.isArray(membershipsData)
            ? membershipsData
            : (membershipsData.memberships ?? []),
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleMemberChange = (memberId: string | null) => {
    setValue("memberId", memberId ?? "", { shouldValidate: true });
    setValue("membershipId", "", { shouldValidate: true });
  };

  const openMembershipDialog = () => {
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setDurationMonths("1");
    setMonthlyFee("");
    setMembershipDialogOpen(true);
  };

  const handleCreateMembership = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedMemberId || !startDate || !monthlyFee) {
      toast.error("Please fill in all membership fields");
      return;
    }

    const fee = Number(monthlyFee);

    if (!Number.isFinite(fee) || fee <= 0) {
      toast.error("Please enter a valid monthly fee");
      return;
    }

    try {
      setSavingMembership(true);

      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          memberId: selectedMemberId,
          startDate,
          durationMonths: Number(durationMonths),
          monthlyFee: fee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create membership");
      }

      const membershipsResponse = await fetch("/api/memberships", {
        credentials: "include",
        cache: "no-store",
      });

      if (!membershipsResponse.ok) {
        throw new Error("Membership created, but could not refresh the list");
      }

      const membershipsData = await membershipsResponse.json();

      const updatedMemberships: Membership[] = Array.isArray(membershipsData)
        ? membershipsData
        : (membershipsData.memberships ?? []);

      setMemberships(updatedMemberships);

      const expectedEndDate = format(
        subDays(
          addMonths(new Date(`${startDate}T12:00:00`), Number(durationMonths)),
          1,
        ),
        "yyyy-MM-dd",
      );

      const createdMembership = updatedMemberships.find(
        (membership) =>
          membership.memberId === selectedMemberId &&
          membership.startDate === startDate &&
          membership.endDate === expectedEndDate,
      );

      if (createdMembership) {
        setValue("membershipId", createdMembership.id, {
          shouldValidate: true,
        });
        setValue("amount", monthlyFee, {
          shouldValidate: true,
        });
      }

      setMembershipDialogOpen(false);
      toast.success(data.message || "Membership created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSavingMembership(false);
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not record payment");
      }

      toast.success(data.message || "Payment recorded successfully");

      reset({
        memberId: "",
        membershipId: "",
        amount: "",
        paymentMode: "",
        paymentDate: "",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>

              <Select
                value={selectedMemberId}
                onValueChange={handleMemberChange}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedMember?.name || "Select member"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.memberId && (
                <p className="text-sm text-destructive">
                  {errors.memberId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Membership</Label>

              <Select
                value={selectedMembershipId}
                onValueChange={(value) =>
                  setValue("membershipId", value ?? "", {
                    shouldValidate: true,
                  })
                }
                disabled={!selectedMemberId || loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedMembership
                      ? `${selectedMembership.startDate} to ${selectedMembership.endDate}`
                      : "Select membership"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {filteredMemberships.map((membership) => (
                    <SelectItem key={membership.id} value={membership.id}>
                      {membership.startDate} to {membership.endDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.membershipId && (
                <p className="text-sm text-destructive">
                  {errors.membershipId.message}
                </p>
              )}

              {hasNoMembership && (
                <div className="space-y-2 rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <p className="text-sm font-medium">
                    This member does not have a membership yet.
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Create a membership before recording a payment.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={openMembershipDialog}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Membership
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>

              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter payment amount"
                {...register("amount")}
              />

              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>

              <Select
                value={watch("paymentMode")}
                onValueChange={(value) =>
                  setValue("paymentMode", value ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              {errors.paymentMode && (
                <p className="text-sm text-destructive">
                  {errors.paymentMode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>

              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate")}
              />

              {errors.paymentDate && (
                <p className="text-sm text-destructive">
                  {errors.paymentDate.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  loading ||
                  hasNoMembership ||
                  !selectedMemberId
                }
              >
                {isSubmitting ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={membershipDialogOpen}
        onOpenChange={setMembershipDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Membership</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateMembership} className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>

              <Input value={selectedMember?.name ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>

              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>

              <Select
                value={durationMonths}
                onValueChange={(value) => setDurationMonths(value ?? "1")}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>

              <Input
                id="monthlyFee"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter monthly fee"
                value={monthlyFee}
                onChange={(event) => setMonthlyFee(event.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMembershipDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={savingMembership}>
                {savingMembership ? "Creating..." : "Create Membership"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
