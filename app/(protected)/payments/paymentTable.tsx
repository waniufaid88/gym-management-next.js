"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type PaymentTableProps = { initialPayments: Payment[] };

export default function PaymentTable({ initialPayments }: PaymentTableProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  function openHistory(member: Member) {
    setSelectedMember(member);
    setHistoryOpen(true);
    fetch(`/api/members/${member.id}/payments`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) =>
        setHistoryPayments(
          data.map((payment: Omit<Payment, "memberId" | "membershipId" | "member">) => ({
            ...payment,
            memberId: member.id,
            membershipId: payment.membership.id,
            member,
          })),
        ),
      )
      .catch(() => toast.error("Could not load payment history"));
  }

  const uniquePayments = payments.filter(
    (payment, index, self) =>
      index === self.findIndex((item) => item.memberId === payment.memberId),
  );

  const memberPayments = historyPayments;

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
        onSuccess={() => router.refresh()}
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
