import { redirect } from "next/navigation";
import { getPayments } from "@/db/server";
import { getServerUserId } from "@/lib/server-auth";
import Pagination from "@/components/pagination";
import PaymentTable from "./paymentTable";

export const instant = false;

type PageProps = {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
};

export default async function PaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const search = params.search?.trim() || "";

  const userId = await getServerUserId();

  if (!userId) redirect("/login");

  const { payments, totalCount, totalPages } = await getPayments(
    userId,
    currentPage,
    params.limit,
    search,
  );

  return (
    <div className="w-full p-6">
      <PaymentTable
        search={search}
        initialPayments={payments.map((payment) => ({
          ...payment,
          paymentDate: payment.paymentDate.toISOString(),
        }))}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalCount}
        rowsPerPage={payments.length}
      />
    </div>
  );
}
