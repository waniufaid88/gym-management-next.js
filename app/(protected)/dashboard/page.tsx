"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  CalendarDays,
  Dumbbell,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  totalMembers: number;
  activeMemberships: number;
  expiringSoon: number;
  monthlyRevenue: number;
};

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMemberships: 0,
    expiringSoon: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    setCurrentMonth(
      new Date().toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    );

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Dashboard API error:", {
            status: response.status,
            response: data,
          });

          throw new Error(
            data.message || "Could not load dashboard statistics",
          );
        }

        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);

        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboardStats = [
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      title: "Active Memberships",
      value: stats.activeMemberships.toLocaleString("en-IN"),
      icon: UserCheck,
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon.toLocaleString("en-IN"),
      icon: Clock,
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Dumbbell className="h-6 w-6" />
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's what's happening at your gym.
          </p>
        </div>

        <Button variant="outline" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          {currentMonth || "Loading..."}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>

                  <div className="rounded-lg bg-muted p-2.5">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  {loading ? "Loading..." : stat.value}
                </h2>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
