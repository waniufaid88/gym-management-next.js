import { redirect } from "next/navigation";

import { getMembers } from "@/db/server";
import { getServerUserId } from "@/lib/server-auth";
import MemberTable from "./memberTable";
import type { GymMember } from "./memberDialog";
import PaginationComponent from "@/components/pagination";

type PageProps = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;

  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const { members, totalCount, totalPages } = await getMembers(
    userId,
    currentPage,
    params.limit,
  );

  return (
    <div className="w-full p-6">
      <MemberTable
        initialMembers={members.map((member) => ({
          ...member,
          gender: member.gender as GymMember["gender"],
          status: member.status as GymMember["status"],
          created_at: member.created_at.toISOString(),
        }))}
      />

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalCount}
        rowsPerPage={members.length}
      />
    </div>
  );
}
