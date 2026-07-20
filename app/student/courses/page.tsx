"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { registerStudentCourses } from "@/app/actions/student";

interface CourseItem {
  _id: string;
  code: string;
  name: string;
  level: number;
  semester: "first" | "second";
  creditUnits: number;
}

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [sessionYear, setSessionYear] = useState("2025/2026");
  const [semester, setSemester] = useState<"first" | "second">("first");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch student info & department courses
  useEffect(() => {
    if (!userId) return;
    async function loadCourses() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/student/courses?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data.availableCourses || []);
          setSelectedCourseIds(data.registeredCourses || []);
        } else {
          toast.error("Failed to load available courses");
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        toast.error("An error occurred while loading courses");
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, [userId]);

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleRegisterCourses = async () => {
    if (!userId || selectedCourseIds.length === 0) {
      toast.error("Please select at least one course to register");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerStudentCourses({
        userId,
        courseIds: selectedCourseIds,
        academicSession: sessionYear,
        semester,
      });
      setIsSubmitting(false);

      if (res.success) {
        toast.success(`Successfully registered ${res.count} courses!`);
      } else {
        toast.error(res.error || "Failed to register courses");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Registration</h2>
          <p className="text-sm text-muted-foreground">
            Select and register your courses for the current academic session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sessionYear} onValueChange={(v: string | null) => setSessionYear(v || "2025/2026")}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025/2026">2025/2026</SelectItem>
              <SelectItem value="2026/2027">2026/2027</SelectItem>
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={(v: any) => setSemester(v)}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first">First Semester</SelectItem>
              <SelectItem value="second">Second Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Courses Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Departmental Courses</CardTitle>
            <CardDescription>
              Check the boxes next to the courses you wish to register.
            </CardDescription>
          </div>
          <Button
            onClick={handleRegisterCourses}
            disabled={isSubmitting || selectedCourseIds.length === 0}
            className="gap-2"
          >
            {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
            Register Selected ({selectedCourseIds.length})
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Credit Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Loading courses...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No courses available for registration in this semester.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course._id);
                  return (
                    <TableRow key={course._id}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCourseSelection(course._id)}
                        />
                      </TableCell>
                      <TableCell className="font-bold text-primary">{course.code}</TableCell>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.level}L</TableCell>
                      <TableCell className="capitalize">{course.semester}</TableCell>
                      <TableCell className="text-right font-semibold">{course.creditUnits}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
