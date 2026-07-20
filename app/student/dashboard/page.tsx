"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  CheckCircle2Icon,
  BookOpenIcon,
  PercentIcon,
  ScanIcon,
  ArrowUpRightIcon,
  ClockIcon,
  AlertTriangleIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CourseStat {
  _id: string;
  code: string;
  name: string;
  creditUnits: number;
  attended: number;
  total: number;
  percentage: number;
}

interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  lecturer: string;
  ip: string;
}

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    async function loadStudentData() {
      try {
        const res = await fetch(`/api/student/dashboard?userId=${userId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load student dashboard", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudentData();
  }, [userId]);

  const student = data?.student;
  const stats = data?.stats;
  const courseStats: CourseStat[] = data?.courseStats || [];
  const history: AttendanceRecord[] = data?.attendanceHistory || [];

  const getPercentageColor = (pct: number) => {
    if (pct >= 75) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (pct >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {student?.user?.name || session?.user?.name || "Student"}!
          </h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Matriculation: <span className="font-semibold">{student?.matricNumber || "N/A"}</span> • Level: <span className="font-semibold">{student?.currentLevel || 100}L</span> • {student?.department || "Computer Science"}
          </p>
        </div>
        <Link
          href="/student/scan"
          className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground hover:bg-background/90 h-11 px-5 font-semibold text-sm shadow-md transition-all shrink-0"
        >
          <ScanIcon className="size-5 text-primary" />
          Scan Attendance QR
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Attendance
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PercentIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : `${stats?.overallPercentage ?? 0}%`}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={getPercentageColor(stats?.overallPercentage ?? 0)}>
                {stats?.overallPercentage >= 75 ? "Eligible for Exams (≥75%)" : "Warning: Below 75% Requirement"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Courses
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpenIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : stats?.totalRegistered ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Courses in current academic session</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classes Attended
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2Icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : `${stats?.attendedClasses ?? 0} / ${stats?.totalClasses ?? 0}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total lecture check-ins verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Breakdown */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Attendance Breakdown</CardTitle>
            <CardDescription>Track your attendance threshold for exam eligibility</CardDescription>
          </div>
          <Link
            href="/student/courses"
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Manage Courses <ArrowUpRightIcon className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseStats.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No registered courses found. Go to Course Registration to add courses.
            </div>
          ) : (
            courseStats.map((course) => (
              <div key={course._id} className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary mr-2">{course.code}</span>
                    <span className="font-medium text-sm">{course.name}</span>
                  </div>
                  <span className="font-bold text-sm">{course.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      course.percentage >= 75 ? "bg-emerald-500" : course.percentage >= 50 ? "bg-amber-500" : "bg-destructive"
                    }`}
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Attended: {course.attended} of {course.total} lectures</span>
                  <span>{course.creditUnits} Credit Units</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance Scans */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Verified Scans</CardTitle>
            <CardDescription>Your recent QR code check-in log</CardDescription>
          </div>
          <Link
            href="/student/history"
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            View Full History <ArrowUpRightIcon className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <span className="font-bold text-primary mr-1">{record.courseCode}</span>
                    <span className="text-xs text-muted-foreground block">{record.courseName}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {record.date}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{record.lecturer}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        record.status === "PRESENT"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
