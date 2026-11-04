"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PaymentDialog from "./paymentDialog";
import MemberPaymentHistory, { type Payment } from "./PaymentHistory";

type Member = {
  id: string;
  name: string;
  phone: string;
};

export default function PaymentTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/payments", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load payments");
        }

        setPayments(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refresh]);

  function openHistory(member: Member) {
    setSelectedMember(member);
    setHistoryOpen(true);
  }

  const uniquePayments = payments.filter(
    (payment, index, self) =>
      index === self.findIndex((item) => item.memberId === payment.memberId),
  );

  const memberPayments = selectedMember
    ? payments.filter((payment) => payment.memberId === selectedMember.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Payments</h2>

          <p className="text-sm text-muted-foreground">
            Manage member payments and payment history.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Membership Period</TableHead>
              <TableHead className="text-right">History</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : uniquePayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              uniquePayments.map((payment) => (
                <TableRow key={payment.memberId}>
                  <TableCell>
                    <div className="font-medium">{payment.member.name}</div>

                    <div className="text-sm text-muted-foreground">
                      {payment.member.phone}
                    </div>
                  </TableCell>

                  <TableCell>
                    ₹{Number(payment.amount).toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>{payment.paymentMode}</TableCell>

                  <TableCell>
                    {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                  </TableCell>

                  <TableCell>
                    {format(
                      new Date(payment.membership.startDate),
                      "dd MMM yyyy",
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(payment.membership.endDate),
                      "dd MMM yyyy",
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openHistory(payment.member)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setRefresh((previous) => previous + 1)}
      />

      <MemberPaymentHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        member={selectedMember}
        payments={memberPayments}
      />
    </div>
  );
}
