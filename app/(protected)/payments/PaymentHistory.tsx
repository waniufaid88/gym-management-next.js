"use client";

import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Payment = {
  id: string;
  memberId: string;
  membershipId: string;
  amount: string;
  paymentMode: string;
  paymentDate: string;
  member: {
    id: string;
    name: string;
    phone: string;
  };
  membership: {
    id: string;
    startDate: string;
    endDate: string;
    monthlyFee: string;
  };
};

type MemberPaymentHistoryProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    name: string;
    phone: string;
  } | null;
  payments: Payment[];
  loading?: boolean;
};

export default function MemberPaymentHistory({
  open,
  onOpenChange,
  member,
  payments,
  loading = false,
}: MemberPaymentHistoryProps) {
  const totalPaid = payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        {" "}
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>

          <DialogDescription>
            {member?.name} - {member?.phone}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>

            <h3 className="mt-2 text-2xl font-bold">{payments.length}</h3>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>

            <h3 className="mt-2 text-2xl font-bold">
              ₹{totalPaid.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Membership Period</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading payment history...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No payment history found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
