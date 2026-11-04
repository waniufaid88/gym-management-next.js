import { redirect } from "next/navigation";
import { getMemberships } from "@/db/server";
import { getServerUserId } from "@/lib/server-auth";
import Pagination from "@/components/pagination";
import MembershipTable from "./membershipTable";

type PageProps = {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
};

export default async function MembershipPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const search = params.search?.trim() || "";

  const userId = await getServerUserId();

  if (!userId) redirect("/login");

  const { memberships, totalCount, totalPages } = await getMemberships(
    userId,
    currentPage,
    params.limit,
    search,
  );

  return (
    <div className="w-full p-6">
      <MembershipTable initialMemberships={memberships} search={search} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalCount}
        rowsPerPage={memberships.length}
      />
    </div>
  );
}
