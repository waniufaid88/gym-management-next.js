"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { SearchForm } from "@/components/searchForm";

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

type PaymentTableProps = { initialPayments: Payment[]; search: string };

export default function PaymentTable({
  initialPayments,
  search,
}: PaymentTableProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  async function openHistory(member: Member) {
    setSelectedMember(member);
    setHistoryPayments([]);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const response = await fetch(`/api/members/${member.id}/payments`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load payment history");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected payment history response");
      }

      setHistoryPayments(
        data.map(
          (
            payment: Omit<Payment, "memberId" | "membershipId" | "member">,
          ) => ({
            ...payment,
            memberId: member.id,
            membershipId: payment.membership.id,
            member,
          }),
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load payment history",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

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

        <div className="flex items-center gap-2">
          <SearchForm
            initialValue={search}
            placeholder="Search payments by name or phone"
            debounce={500}
          />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
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
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
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
        loading={historyLoading}
      />
    </div>
  );
}
