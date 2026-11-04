import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMemberships } from "@/db/server";
import { getServerUserId } from "@/lib/server-auth";
import Pagination from "@/components/pagination";
import MembershipTable from "./membershipTable";

type PageProps = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default function MembershipPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="p-6">Loading memberships...</div>}>
      <MembershipContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MembershipContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const userId = await getServerUserId();

  if (!userId) redirect("/login");

  const { memberships, totalCount, totalPages } = await getMemberships(
    userId,
    currentPage,
    params.limit,
  );

  return (
    <div className="w-full p-6">
      <MembershipTable initialMemberships={memberships} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalCount}
        rowsPerPage={memberships.length}
      />
    </div>
  );
}
