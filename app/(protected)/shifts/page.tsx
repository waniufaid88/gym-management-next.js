import { redirect } from "next/navigation";
import { getShifts } from "@/db/server";
import { getServerUserId } from "@/lib/server-auth";
import Pagination from "@/components/pagination";
import ShiftTable from "./shiftTable";

type PageProps = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function ShiftsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;

  const userId = await getServerUserId();

  if (!userId) redirect("/login");

  const { shifts, totalCount, totalPages } = await getShifts(
    userId,
    currentPage,
    params.limit,
  );

  return (
    <div className="w-full p-6">
      <ShiftTable initialShifts={shifts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalCount}
        rowsPerPage={shifts.length}
      />
    </div>
  );
}
