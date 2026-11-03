import MembershipTable from "./membershipTable";

export default function MembershipPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Memberships</h1>
        <p className="text-sm text-muted-foreground">
          Manage gym memberships and track their validity.
        </p>
      </div>

      <MembershipTable />
    </div>
  );
}
