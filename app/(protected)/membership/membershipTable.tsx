"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDays,
  differenceInCalendarMonths,
  format,
  parseISO,
} from "date-fns";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MembershipDialog from "./membershipDialog";

type GymMember = {
  id: string;
  name: string;
  phone: string;
};

type Membership = {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  monthlyFee: string;
  member: GymMember;
};

type MembershipStatus = "active" | "expired" | "upcoming";

function getMembershipStatus(
  startDate: string,
  endDate: string,
): MembershipStatus {
  const today = format(new Date(), "yyyy-MM-dd");

  if (startDate > today) {
    return "upcoming";
  }

  if (endDate < today) {
    return "expired";
  }

  return "active";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return format(parseISO(date), "dd/MM/yyyy");
}

function getDuration(startDate: string, endDate: string) {
  return differenceInCalendarMonths(
    addDays(parseISO(endDate), 1),
    parseISO(startDate),
  );
}

export default function MembershipTable() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/memberships", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch memberships");
      }

      setMemberships(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch memberships",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const filteredMemberships = memberships.filter((membership) => {
    const search = searchValue.toLowerCase();

    return (
      membership.member?.name.toLowerCase().includes(search) ||
      membership.member?.phone.includes(search)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and Add Membership */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search by member name or phone"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-9"
          />
        </div>

        <MembershipDialog onSuccess={fetchMemberships} />
      </div>

      {/* Membership Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading memberships...
                </TableCell>
              </TableRow>
            ) : filteredMemberships.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchValue
                    ? "No memberships found."
                    : "No memberships available. Add your first membership."}
                </TableCell>
              </TableRow>
            ) : (
              filteredMemberships.map((membership) => {
                const duration = getDuration(
                  membership.startDate,
                  membership.endDate,
                );

                const monthlyFee = Number(membership.monthlyFee);
                const totalFee = monthlyFee * duration;

                const status = getMembershipStatus(
                  membership.startDate,
                  membership.endDate,
                );

                return (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium">
                      {membership.member?.name ?? "Unknown"}
                    </TableCell>

                    <TableCell>{membership.member?.phone ?? "-"}</TableCell>

                    <TableCell>{formatDate(membership.startDate)}</TableCell>

                    <TableCell>{formatDate(membership.endDate)}</TableCell>

                    <TableCell>
                      {duration} {duration === 1 ? "Month" : "Months"}
                    </TableCell>

                    <TableCell>{formatCurrency(monthlyFee)}</TableCell>

                    <TableCell className="font-medium">
                      {formatCurrency(totalFee)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={status === "active" ? "default" : "secondary"}
                        className={
                          status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : status === "expired"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMemberships}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
