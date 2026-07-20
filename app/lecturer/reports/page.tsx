"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheetIcon,
  DownloadIcon,
  PrinterIcon,
  FileTextIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LecturerReportsPage() {
  const [format, setFormat] = useState<"excel" | "csv">("excel");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleDownloadReport = (exportFormat: "excel" | "csv") => {
    window.open(`/api/lecturer/export?format=${exportFormat}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const sampleLogs = [
    { id: "1", name: "Alice Smith", matric: "AGU/CSC/2026/001", course: "CSC401", date: "2026-07-18 10:15 AM", status: "PRESENT", ip: "192.168.1.45" },
    { id: "2", name: "Bob Jones", matric: "AGU/CSC/2026/002", course: "CSC401", date: "2026-07-18 10:17 AM", status: "PRESENT", ip: "192.168.1.48" },
    { id: "3", name: "Charlie Brown", matric: "AGU/CSC/2026/003", course: "CSC403", date: "2026-07-17 02:05 PM", status: "PRESENT", ip: "192.168.1.50" },
    { id: "4", name: "David Miller", matric: "AGU/CSC/2026/004", course: "CSC405", date: "2026-07-15 11:30 AM", status: "LATE", ip: "192.168.1.52" },
  ];

  const filteredLogs = sampleLogs.filter(
    (log) =>
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.matric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Reports & Exports</h2>
          <p className="text-sm text-muted-foreground">
            Generate and export accredited course attendance sheets in PDF, Excel, and CSV formats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleDownloadReport("csv")}
            className="gap-2"
          >
            <FileTextIcon className="size-4 text-emerald-500" />
            Export CSV
          </Button>

          <Button
            onClick={() => handleDownloadReport("excel")}
            className="gap-2 shadow-md shadow-primary/20"
          >
            <FileSpreadsheetIcon className="size-4" />
            Export Excel (.xlsx)
          </Button>

          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <PrinterIcon className="size-4" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Filter by Course</span>
              <Select value={selectedCourse} onValueChange={(v: string | null) => setSelectedCourse(v || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="CSC401">CSC401 - Software Engineering</SelectItem>
                  <SelectItem value="CSC403">CSC403 - Database Systems</SelectItem>
                  <SelectItem value="CSC405">CSC405 - Computer Networks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold text-muted-foreground">Global Search</span>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, matriculation number, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Report Preview</CardTitle>
          <CardDescription>Displaying {filteredLogs.length} verified attendance logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Matriculation No.</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-semibold">{log.name}</TableCell>
                  <TableCell className="font-mono text-xs">{log.matric}</TableCell>
                  <TableCell className="font-bold text-primary">{log.course}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.status === "PRESENT"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {log.ip}
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
