"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2Icon,
  PlusIcon,
  BookOpenIcon,
  GraduationCapIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createDepartment, createProgramme, createCourse } from "@/app/actions/academic";

interface Item {
  _id: string;
  name: string;
  code: string;
  durationYears?: number;
  creditUnits?: number;
  level?: number;
}

export default function AcademicSetupPage() {
  const [institutions, setInstitutions] = useState<Item[]>([]);
  const [departments, setDepartments] = useState<Item[]>([]);
  const [programmes, setProgrammes] = useState<Item[]>([]);
  const [courses, setCourses] = useState<Item[]>([]);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isProgDialogOpen, setIsProgDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Form inputs
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");

  const [progName, setProgName] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progDuration, setProgDuration] = useState("4");

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseLevel, setCourseLevel] = useState("100");
  const [courseSemester, setCourseSemester] = useState<"first" | "second">("first");
  const [courseCredits, setCourseCredits] = useState("3");

  // Load institutions on mount
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await fetch("/api/academic-data?type=institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
          if (data.length > 0) {
            setSelectedInstitutionId(data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch institutions", err);
      }
    }
    fetchInstitutions();
  }, []);

  // Fetch departments when institution changes
  useEffect(() => {
    if (!selectedInstitutionId) return;
    async function fetchDepartments() {
      try {
        const res = await fetch(`/api/academic-data?type=departments&institutionId=${selectedInstitutionId}`);
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
          if (data.length > 0) {
            setSelectedDepartmentId(data[0]._id);
          } else {
            setSelectedDepartmentId("");
            setProgrammes([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    }
    fetchDepartments();
  }, [selectedInstitutionId]);

  // Fetch programmes when department changes
  useEffect(() => {
    if (!selectedDepartmentId) return;
    async function fetchProgrammes() {
      try {
        const res = await fetch(`/api/academic-data?type=programmes&departmentId=${selectedDepartmentId}`);
        if (res.ok) {
          const data = await res.json();
          setProgrammes(data);
        }
      } catch (err) {
        console.error("Failed to fetch programmes", err);
      }
    }
    fetchProgrammes();
  }, [selectedDepartmentId]);

  const handleCreateDepartment = async () => {
    if (!deptName || !deptCode || !selectedInstitutionId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const res = await createDepartment({
      name: deptName,
      code: deptCode,
      institutionId: selectedInstitutionId,
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Department created successfully!");
      setIsDeptDialogOpen(false);
      setDeptName("");
      setDeptCode("");
      // Refresh departments
      const refreshed = await fetch(`/api/academic-data?type=departments&institutionId=${selectedInstitutionId}`);
      if (refreshed.ok) setDepartments(await refreshed.json());
    } else {
      toast.error(res.error || "Failed to create department");
    }
  };

  const handleCreateProgramme = async () => {
    if (!progName || !progCode || !selectedDepartmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const res = await createProgramme({
      name: progName,
      code: progCode,
      departmentId: selectedDepartmentId,
      durationYears: parseInt(progDuration, 10),
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Programme created successfully!");
      setIsProgDialogOpen(false);
      setProgName("");
      setProgCode("");
      // Refresh programmes
      const refreshed = await fetch(`/api/academic-data?type=programmes&departmentId=${selectedDepartmentId}`);
      if (refreshed.ok) setProgrammes(await refreshed.json());
    } else {
      toast.error(res.error || "Failed to create programme");
    }
  };

  const handleCreateCourse = async () => {
    if (!courseName || !courseCode || !selectedInstitutionId || !selectedDepartmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const res = await createCourse({
      name: courseName,
      code: courseCode,
      institutionId: selectedInstitutionId,
      departmentId: selectedDepartmentId,
      level: parseInt(courseLevel, 10),
      semester: courseSemester,
      creditUnits: parseInt(courseCredits, 10),
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Course created successfully!");
      setIsCourseDialogOpen(false);
      setCourseName("");
      setCourseCode("");
    } else {
      toast.error(res.error || "Failed to create course");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Structure Setup</h2>
          <p className="text-sm text-muted-foreground">
            Manage your departments, degree programmes, and accredited courses.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedInstitutionId}
            onValueChange={(val: string | null) => setSelectedInstitutionId(val || "")}
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select Institution" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((inst) => (
                <SelectItem key={inst._id} value={inst._id}>
                  {inst.name} ({inst.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted p-1 rounded-xl">
          <TabsTrigger value="departments" className="gap-2">
            <Building2Icon className="size-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="programmes" className="gap-2">
            <GraduationCapIcon className="size-4" />
            Programmes
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpenIcon className="size-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Departments</CardTitle>
                <CardDescription>
                  List of departments registered under the active institution.
                </CardDescription>
              </div>
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-sm font-medium transition-all">
                  <PlusIcon className="size-4" />
                  Add Department
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                    <DialogDescription>
                      Enter department details to register under your institution.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="deptName">Department Name</Label>
                      <Input
                        id="deptName"
                        placeholder="e.g. Computer Science"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deptCode">Department Code</Label>
                      <Input
                        id="deptCode"
                        placeholder="e.g. CSC"
                        value={deptCode}
                        onChange={(e) => setDeptCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDepartment} disabled={isLoading}>
                      {isLoading ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
                      Create Department
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                        No departments found. Click &quot;Add Department&quot; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept._id}>
                        <TableCell className="font-bold text-primary">{dept.code}</TableCell>
                        <TableCell>{dept.name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programmes Tab */}
        <TabsContent value="programmes">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Academic Programmes</CardTitle>
                <CardDescription>Degree programmes offered within departments.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(val: string | null) => setSelectedDepartmentId(val || "")}
                >
                  <SelectTrigger className="w-56 bg-card">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={isProgDialogOpen} onOpenChange={setIsProgDialogOpen}>
                  <DialogTrigger
                    disabled={!selectedDepartmentId}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50"
                  >
                    <PlusIcon className="size-4" />
                    Add Programme
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Programme</DialogTitle>
                      <DialogDescription>
                        Create a degree or certificate programme.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="progName">Programme Title</Label>
                        <Input
                          id="progName"
                          placeholder="e.g. B.Sc. Computer Science"
                          value={progName}
                          onChange={(e) => setProgName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="progCode">Programme Code</Label>
                        <Input
                          id="progCode"
                          placeholder="e.g. BSC-CSC"
                          value={progCode}
                          onChange={(e) => setProgCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="progDuration">Duration (Years)</Label>
                        <Select value={progDuration} onValueChange={(v: string | null) => setProgDuration(v || "4")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProgDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProgramme} disabled={isLoading}>
                        {isLoading ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
                        Create Programme
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programme Code</TableHead>
                    <TableHead>Programme Name</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programmes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No programmes found for the selected department.
                      </TableCell>
                    </TableRow>
                  ) : (
                    programmes.map((prog) => (
                      <TableRow key={prog._id}>
                        <TableCell className="font-bold text-primary">{prog.code}</TableCell>
                        <TableCell>{prog.name}</TableCell>
                        <TableCell>{prog.durationYears} Years</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accredited Courses</CardTitle>
                <CardDescription>Courses registered under departments.</CardDescription>
              </div>
              <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <DialogTrigger
                  disabled={!selectedDepartmentId}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50"
                >
                  <PlusIcon className="size-4" />
                  Add Course
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                      Register a course code and description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="courseName">Course Title</Label>
                      <Input
                        id="courseName"
                        placeholder="e.g. Software Engineering"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseCode">Course Code</Label>
                      <Input
                        id="courseCode"
                        placeholder="e.g. CSC401"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={courseLevel} onValueChange={(v: string | null) => setCourseLevel(v || "100")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100 Level</SelectItem>
                            <SelectItem value="200">200 Level</SelectItem>
                            <SelectItem value="300">300 Level</SelectItem>
                            <SelectItem value="400">400 Level</SelectItem>
                            <SelectItem value="500">500 Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Semester</Label>
                        <Select value={courseSemester} onValueChange={(v: any) => setCourseSemester(v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">First Semester</SelectItem>
                            <SelectItem value="second">Second Semester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCourse} disabled={isLoading}>
                      {isLoading ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
                      Create Course
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Select a department above to view or manage accredited courses.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
