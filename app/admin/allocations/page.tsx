"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpenIcon, Loader2Icon, SaveIcon, CheckIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function CourseAllocationsPage() {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/allocations");
        if (res.ok) {
          const data = await res.json();
          setLecturers(data.lecturers || []);
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to load allocation data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // When a lecturer is selected, update the selected courses checkboxes
  useEffect(() => {
    if (selectedLecturerId) {
      const lec = lecturers.find(l => l.id === selectedLecturerId);
      if (lec) {
        setSelectedCourseIds(lec.assignedCourses.map((c: any) => c.id));
      }
    } else {
      setSelectedCourseIds([]);
    }
  }, [selectedLecturerId, lecturers]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSave = async () => {
    if (!selectedLecturerId) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lecturerId: selectedLecturerId,
          courseIds: selectedCourseIds,
        }),
      });
      
      if (res.ok) {
        toast.success("Courses allocated successfully");
        // Update local state to reflect changes without reloading
        setLecturers(prev => prev.map(l => {
          if (l.id === selectedLecturerId) {
            const updatedCourses = courses.filter(c => selectedCourseIds.includes(c.id));
            return { ...l, assignedCourses: updatedCourses };
          }
          return l;
        }));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to allocate courses");
      }
    } catch (err) {
      toast.error("An error occurred during allocation");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLecturer = lecturers.find(l => l.id === selectedLecturerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Allocations</h2>
          <p className="text-sm text-muted-foreground">
            Assign courses to teaching staff across departments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm md:col-span-1 h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpenIcon className="size-5" />
              </div>
              <div>
                <CardTitle>Select Lecturer</CardTitle>
                <CardDescription>Choose a staff member</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedLecturerId} onValueChange={(val: string | null) => setSelectedLecturerId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Lecturer..." />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map(lec => (
                    <SelectItem key={lec.id} value={lec.id}>
                      {lec.name} ({lec.staffId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedLecturer && (
              <div className="p-4 rounded-xl bg-muted/50 border space-y-2 mt-4">
                <p className="text-sm font-semibold">Current Allocation</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLecturer.assignedCourses.length} courses assigned
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedLecturer.assignedCourses.map((c: any) => (
                    <Badge key={c.id} variant="secondary" className="text-[10px]">
                      {c.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assign Courses</CardTitle>
              <CardDescription>Select the courses this lecturer will teach</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={!selectedLecturerId || isSaving} className="gap-2">
              {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Save Allocation
            </Button>
          </CardHeader>
          <CardContent>
            {!selectedLecturerId ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                Select a lecturer to assign courses
              </div>
            ) : isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {courses.map(course => (
                  <div 
                    key={course.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedCourseIds.includes(course.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleCourse(course.id)}
                  >
                    <Checkbox 
                      checked={selectedCourseIds.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    <div className="space-y-1 leading-none flex-1">
                      <p className="font-medium text-sm text-primary">{course.code}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{course.name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{course.creditUnits} Units</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
