"use client";

import { useEffect, useState } from "react";
import { format, parseISO, differenceInYears } from "date-fns";
import { toast } from "react-hot-toast";
import { CalendarDays, CreditCard, Phone, MapPin, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { GymMember } from "./memberDialog";

type Payment = {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMode: string;
};

type MemberViewProps = {
  member: GymMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(date: string) {
  if (!date) return "-";

  return format(parseISO(date.slice(0, 10)), "dd/MM/yyyy");
}

function calculateAge(dob: string) {
  if (!dob) return "-";

  const birthDate = parseISO(dob.slice(0, 10));

  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
    return "-";
  }

  return differenceInYears(new Date(), birthDate);
}

export default function MemberView({
  member,
  open,
  onOpenChange,
}: MemberViewProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !member) return;

    async function fetchPayments() {
      try {
        setLoading(true);
        setError("");
        setPayments([]);

        const response = await fetch(`/api/members/${member!.id}/payments`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load payment history");
        }

        setPayments(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load payment history";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [open, member]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View member information and payment history.
          </DialogDescription>
        </DialogHeader>

        {member && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{member.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{member.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Gender / Age
                    </p>
                    <p className="font-medium">
                      {member.gender} / {calculateAge(member.dob)} years
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">{formatDate(member.dob)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{member.address || "-"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Gym Shift</p>
                  <p className="mt-1 font-medium">
                    {member.shift
                      ? `${member.shift.startTime.slice(0, 5)} - ${member.shift.endTime.slice(0, 5)}`
                      : "No shift assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Joined Date</p>
                  <p className="mt-1 font-medium">
                    {formatDate(member.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-semibold">Payment History</h3>
                <Badge variant="secondary">{payments.length} Payments</Badge>
              </div>

              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading payment history...
                </div>
              ) : error ? (
                <div className="py-8 text-center text-sm text-destructive">
                  {error}
                </div>
              ) : payments.length > 0 ? (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(
                              parseISO(payment.paymentDate),
                              "dd/MM/yyyy",
                            )}
                          </TableCell>

                          <TableCell>
                            ₹{Number(payment.amount).toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell>{payment.paymentMode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CreditCard className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                    <p className="font-medium">No payment history</p>

                    <p className="text-sm text-muted-foreground">
                      No payments have been recorded for this member yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
