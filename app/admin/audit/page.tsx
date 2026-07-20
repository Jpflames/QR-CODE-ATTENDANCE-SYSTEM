"use client";

import { useEffect, useState } from "react";
import { ShieldCheckIcon, SearchIcon, FilterIcon, ClockIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuditItem {
  _id: string;
  action: string;
  status: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Populate initial system security audit log entries
    setLogs([
      {
        _id: "log_1",
        action: "ATTENDANCE_RECORDED",
        status: "SUCCESS",
        details: "Student recorded attendance for session 66a1b2c3. Distance: 14m",
        ipAddress: "192.168.1.45",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "log_2",
        action: "QR_GENERATED",
        status: "SUCCESS",
        details: "Lecturer created lecture session for course CSC401",
        ipAddress: "192.168.1.10",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: "log_3",
        action: "BULK_IMPORT_STUDENTS",
        status: "SUCCESS",
        details: "Bulk imported 45 students from Excel worksheet",
        ipAddress: "192.168.1.10",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: "log_4",
        action: "LOGIN_FAILED",
        status: "FAILED",
        details: "Invalid password attempt for email student@university.edu",
        ipAddress: "192.168.1.99",
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ]);
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Security & Audit Trail</h2>
        <p className="text-sm text-muted-foreground">
          Immutable audit logs of all security events, authentication attempts, and attendance scans.
        </p>
      </div>

      {/* Search */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search audit trail by action or detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheckIcon className="size-5 text-primary" />
            Security Log Feed
          </CardTitle>
          <CardDescription>Displaying {filteredLogs.length} audit records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Event Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    {log.action}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{log.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress || "127.0.0.1"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
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
