"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  UserCheckIcon,
  Building2Icon,
  BookOpenIcon,
  CheckCircle2Icon,
  CalendarIcon,
  ArrowUpRightIcon,
  PlusIcon,
  FileSpreadsheetIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AdminStats {
  totalStudents: number;
  totalLecturers: number;
  totalDepartments: number;
  totalCourses: number;
  todayAttendance: number;
  todaySessions: number;
  attendanceTrends: { name: string; scans: number; sessions: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: UsersIcon,
      description: "Registered across all programmes",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Lecturers",
      value: stats?.totalLecturers ?? 0,
      icon: UserCheckIcon,
      description: "Active academic staff",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance ?? 0,
      icon: CheckCircle2Icon,
      description: "Verified student check-ins",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Active Sessions Today",
      value: stats?.todaySessions ?? 0,
      icon: CalendarIcon,
      description: "Lecture sessions created today",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Departments",
      value: stats?.totalDepartments ?? 0,
      icon: Building2Icon,
      description: "Academic departments",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Courses Offered",
      value: stats?.totalCourses ?? 0,
      icon: BookOpenIcon,
      description: "Active accredited courses",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <p className="text-sm text-muted-foreground">
            Real-time analytics and management metrics for your institution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted h-9 px-4 text-sm font-medium transition-all"
          >
            <FileSpreadsheetIcon className="size-4" />
            Bulk Import
          </Link>
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-sm font-medium transition-all"
          >
            <PlusIcon className="size-4" />
            Academic Setup
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {isLoading ? "..." : card.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily verified QR scans vs active lecture sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {stats?.attendanceTrends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.attendanceTrends}>
                    <defs>
                      <linearGradient id="scansColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#scansColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading trend data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Session Overview */}
        <Card className="border-border shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Quick Management</CardTitle>
            <CardDescription>Shortcuts for institution setup & allocations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            <Link
              href="/admin/academic"
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Building2Icon className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Departments & Courses</h4>
                  <p className="text-xs text-muted-foreground">Manage faculties, departments & courses</p>
                </div>
              </div>
              <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/allocations"
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BookOpenIcon className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Course Allocations</h4>
                  <p className="text-xs text-muted-foreground">Assign courses to teaching staff</p>
                </div>
              </div>
              <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/import"
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <FileSpreadsheetIcon className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Excel Bulk Import</h4>
                  <p className="text-xs text-muted-foreground">Import student & staff rosters from Excel</p>
                </div>
              </div>
              <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
