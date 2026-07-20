"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  BookOpenIcon,
  UsersIcon,
  QrCodeIcon,
  CheckCircle2Icon,
  PlusCircleIcon,
  ArrowUpRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LecturerDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    async function loadData() {
      try {
        const res = await fetch(`/api/lecturer/dashboard?userId=${user?.id}`);
        if (res.ok) {
          const json = await res.json();
          setAssignedCourses(json.assignedCourses || []);
          setStats(json.stats || null);
        }
      } catch (err) {
        console.error("Failed to load lecturer dashboard", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || "Lecturer"}!
          </h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Manage your course sessions, track real-time attendance, and generate reports.
          </p>
        </div>
        <Link
          href="/lecturer/session"
          className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground hover:bg-background/90 h-11 px-5 font-semibold text-sm shadow-md transition-all shrink-0"
        >
          <PlusCircleIcon className="size-5 text-primary" />
          Start QR Session
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Courses
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpenIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{assignedCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active courses taught this semester</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrolled Students
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <UsersIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{isLoading ? "..." : (stats?.totalEnrolled || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all assigned courses</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Attendance
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2Icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{isLoading ? "..." : `${stats?.avgAttendance || 0}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">Overall course attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Courses Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Courses & Performance</CardTitle>
            <CardDescription>View enrolled student counts and average attendance</CardDescription>
          </div>
          <Link
            href="/lecturer/reports"
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Export Detailed Reports <ArrowUpRightIcon className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Enrolled Students</TableHead>
                <TableHead>Avg Attendance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading courses...</TableCell>
                </TableRow>
              ) : assignedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No courses assigned yet. Contact your administrator.</TableCell>
                </TableRow>
              ) : (
                assignedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-bold text-primary">{course.code}</TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.students} Students</TableCell>
                    <TableCell className="font-semibold text-emerald-500">{course.avgAttendance}%</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/lecturer/session?courseId=${course.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <QrCodeIcon className="size-3.5" /> Launch QR
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
